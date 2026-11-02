import test from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPair, SignJWT } from 'jose';
import { authService, verifyGoogleCredential } from '../src/services/authService.js';

const clientId = 'test-client.apps.googleusercontent.com';
const nonce = 'test-login-nonce';
const { privateKey, publicKey } = await generateKeyPair('RS256');
const sign = (overrides = {}) => new SignJWT({
    sub: 'google-account-123', name: 'EV Owner', email: 'owner@example.com',
    nonce, iss: 'https://accounts.google.com', aud: clientId,
    iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 600,
    ...overrides,
}).setProtectedHeader({ alg: 'RS256' }).sign(privateKey);

test('accepts a signed Google credential and maps the stable subject to the local profile', async () => {
    const user = await verifyGoogleCredential(await sign(), clientId, nonce, publicKey);
    assert.equal(user.id, 'google-account-123');
    assert.equal(user.provider, 'google');
    assert.equal(user.email, 'owner@example.com');
    assert.equal(Object.hasOwn(user, 'credential'), false);
});

for (const [name, overrides] of [
    ['wrong audience', { aud: 'other-app' }],
    ['wrong issuer', { iss: 'https://attacker.example' }],
    ['expired token', { exp: Math.floor(Date.now() / 1000) - 60 }],
    ['wrong nonce', { nonce: 'other-login' }],
    ['missing expiry', { exp: undefined }],
    ['missing subject', { sub: undefined }],
]) {
    test(`rejects ${name}`, async () => {
        await assert.rejects(verifyGoogleCredential(await sign(overrides), clientId, nonce, publicKey));
    });
}

test('rejects a token signed with a different key', async () => {
    const other = await generateKeyPair('RS256');
    await assert.rejects(verifyGoogleCredential(await sign(), clientId, nonce, other.publicKey));
});

test('rejects missing configuration and credentials', async () => {
    await assert.rejects(verifyGoogleCredential('', clientId, nonce, publicKey));
    await assert.rejects(verifyGoogleCredential(await sign(), '', nonce, publicKey));
});

test('restores real local profiles, rejects legacy/corrupt sessions, and signs out without deleting logs', async () => {
    const values = new Map();
    globalThis.localStorage = {
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        removeItem: key => values.delete(key),
    };
    globalThis.window = {};
    assert.equal(authService.getCurrentUser(), null);
    localStorage.setItem('ev_mate_user', JSON.stringify({ id: 'usr_123456789' }));
    assert.equal(authService.getCurrentUser(), null);
    localStorage.setItem('ev_mate_user', '{broken');
    assert.equal(authService.getCurrentUser(), null);
    localStorage.setItem('ev_mate_vehicles_usr_123456789', JSON.stringify([{ id: 'vehicle-1' }]));
    assert.equal(authService.hasLegacyData(), true);
    const user = { id: 'google-account-123', provider: 'google' };
    localStorage.setItem('ev_mate_user', JSON.stringify(user));
    localStorage.setItem('ev_mate_trips_vehicle-1', '[{"distance":100}]');
    assert.deepEqual(authService.getCurrentUser(), user);
    await authService.logout();
    assert.equal(authService.getCurrentUser(), null);
    assert.equal(localStorage.getItem('ev_mate_trips_vehicle-1'), '[{"distance":100}]');
    localStorage.setItem('ev_mate_legacy_owner', user.id);
    assert.equal(authService.hasLegacyData(), false);
});

test('migrates a garage with 200 entries without changing logs or assigning them to a second account', () => {
    const values = new Map();
    globalThis.localStorage = {
        getItem: key => values.get(key) ?? null,
        setItem: (key, value) => values.set(key, value),
        removeItem: key => values.delete(key),
    };
    const legacyKey = 'ev_mate_vehicles_usr_123456789';
    const vehicle = { id: 'phone-vehicle', userId: 'usr_123456789', batteryCapacity: 40.5 };
    localStorage.setItem(legacyKey, JSON.stringify([vehicle]));
    localStorage.setItem('last_vehicle_usr_123456789', vehicle.id);
    const logKeys = ['ev_mate_trips_phone-vehicle', 'ev_mate_charging_phone-vehicle', 'ev_mate_maintenance_phone-vehicle'];
    const before = logKeys.map((key, index) => {
        const logs = JSON.stringify(Array.from({ length: index === 0 ? 100 : 50 }, (_, i) => ({ id: `${index}-${i}`, amount: i })));
        localStorage.setItem(key, logs);
        return logs;
    });
    localStorage.setItem('ev_mate_vehicles_google-owner', JSON.stringify([{ id: 'existing-vehicle' }]));
    authService.migrateLegacyData({ id: 'google-owner' });
    const vehicles = JSON.parse(localStorage.getItem('ev_mate_vehicles_google-owner'));
    assert.equal(vehicles.length, 2);
    assert.equal(vehicles[1].userId, 'google-owner');
    assert.equal(localStorage.getItem('last_vehicle_google-owner'), vehicle.id);
    logKeys.forEach((key, index) => assert.equal(localStorage.getItem(key), before[index]));
    assert.equal(JSON.parse(localStorage.getItem(legacyKey))[0].id, vehicle.id);
    authService.migrateLegacyData({ id: 'google-owner' });
    assert.equal(JSON.parse(localStorage.getItem('ev_mate_vehicles_google-owner')).length, 2);
    authService.migrateLegacyData({ id: 'another-account' });
    assert.equal(localStorage.getItem('ev_mate_vehicles_another-account'), null);
});
