import { tripService } from './tripService';

export const chargingService = {
    getChargingLogs: (vehicleId) => {
        const logs = localStorage.getItem(`ev_mate_charging_${vehicleId}`);
        return logs ? JSON.parse(logs) : [];
    },

    addLog: (vehicleId, logData) => {
        const logs = chargingService.getChargingLogs(vehicleId);
        const newLog = {
            ...logData,
            id: Date.now().toString(),
            vehicleId,
            createdAt: new Date().toISOString()
        };

        logs.push(newLog);
        localStorage.setItem(`ev_mate_charging_${vehicleId}`, JSON.stringify(logs));
        return newLog;
    },

    calculateHomeCharging: (initialSoC, finalSoC, batteryCapacity, tariff, chargerType) => {
        // Units Consumed Calculation
        const socDiff = parseFloat(finalSoC) - parseFloat(initialSoC);
        if (socDiff <= 0) return { units: 0, cost: 0 };

        // Energy pushed into battery
        const energyAdded = (socDiff / 100) * batteryCapacity;

        // Efficiency Adjustment (Grid to Battery)
        // If Charger < 7 kW: 85% efficiency
        // If Charger >= 7 kW: 90% efficiency
        const efficiency = parseFloat(chargerType) < 7 ? 0.85 : 0.90;

        // Units drawn from grid = Energy Added / Efficiency
        const unitsConsumed = energyAdded / efficiency;

        const cost = unitsConsumed * parseFloat(tariff);

        return {
            units: unitsConsumed.toFixed(2),
            cost: cost.toFixed(2),
            energyAdded: energyAdded.toFixed(2),
            efficiency_factor: efficiency
        };
    },

    getLastCharge: (vehicleId) => {
        const logs = chargingService.getChargingLogs(vehicleId);
        return logs.length > 0 ? logs[logs.length - 1] : null;
    },

    getLastSoC: (vehicleId) => {
        const lastCharge = chargingService.getLastCharge(vehicleId);
        if (lastCharge) return lastCharge.finalSoC;

        // Fallback to Trip if needed, but this circular dependency might be bad if I import tripService here.
        // The original code imported tripService.
        // Let's keep it simple: This service just deals with Charging Logs.
        // The higher level logic for "Start State" should probably live in a helper or directly in the Component/Context.

        return null;
    },

    updateLog: (vehicleId, logId, updatedData) => {
        const logs = chargingService.getChargingLogs(vehicleId);
        const index = logs.findIndex(l => l.id === logId);
        if (index !== -1) {
            logs[index] = { ...logs[index], ...updatedData };
            localStorage.setItem(`ev_mate_charging_${vehicleId}`, JSON.stringify(logs));
            return logs[index];
        }
        return null;
    },

    deleteLog: (vehicleId, logId) => {
        const logs = chargingService.getChargingLogs(vehicleId);
        const filtered = logs.filter(l => l.id !== logId);
        localStorage.setItem(`ev_mate_charging_${vehicleId}`, JSON.stringify(filtered));
    }
};
