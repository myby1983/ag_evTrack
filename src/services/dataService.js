// src/services/dataService.js

const EV_MATE_PREFIXES = ['ev_mate_', 'last_vehicle_'];

export const dataService = {

    /**
     * Collects all EV Mate keys from LocalStorage and returns a structured backup object.
     */
    collectAllData: () => {
        const data = {};
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (EV_MATE_PREFIXES.some(prefix => key.startsWith(prefix))) {
                try {
                    data[key] = JSON.parse(localStorage.getItem(key));
                } catch {
                    // If it's not valid JSON, store as raw string
                    data[key] = localStorage.getItem(key);
                }
            }
        }
        return data;
    },

    /**
     * Exports all EV Mate data as a downloadable JSON file.
     * Returns the count of keys exported.
     */
    exportData: () => {
        const data = dataService.collectAllData();
        const keyCount = Object.keys(data).length;

        if (keyCount === 0) {
            return { success: false, message: 'No data found to export.', count: 0 };
        }

        const backup = {
            _meta: {
                app: 'EV Mate',
                version: '1.0.0',
                exportedAt: new Date().toISOString(),
                keyCount: keyCount
            },
            data: data
        };

        const jsonStr = JSON.stringify(backup, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const dateStr = new Date().toISOString().split('T')[0];
        const filename = `evmate_backup_${dateStr}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return { success: true, message: `Exported ${keyCount} keys.`, count: keyCount };
    },

    /**
     * Imports data from a backup JSON file. Full replacement strategy:
     * 1. Clears ALL existing EV Mate keys
     * 2. Writes all keys from the backup
     * 
     * @param {File} file - The JSON backup file
     * @returns {Promise<{success: boolean, message: string, count: number}>}
     */
    importData: (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const parsed = JSON.parse(e.target.result);

                    // Validate structure
                    if (!parsed._meta || !parsed.data) {
                        resolve({ success: false, message: 'Invalid backup file format. Missing _meta or data.', count: 0 });
                        return;
                    }

                    if (parsed._meta.app !== 'EV Mate') {
                        resolve({ success: false, message: 'This file is not an EV Mate backup.', count: 0 });
                        return;
                    }

                    const dataKeys = Object.keys(parsed.data);
                    if (dataKeys.length === 0) {
                        resolve({ success: false, message: 'Backup file contains no data.', count: 0 });
                        return;
                    }

                    // Step 1: Clear ALL existing EV Mate keys
                    dataService.clearAllData();

                    // Step 2: Write all keys from backup
                    dataKeys.forEach(key => {
                        const value = parsed.data[key];
                        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                    });

                    resolve({
                        success: true,
                        message: `Imported ${dataKeys.length} keys from backup (${parsed._meta.exportedAt}).`,
                        count: dataKeys.length
                    });

                } catch (err) {
                    resolve({ success: false, message: `Failed to parse file: ${err.message}`, count: 0 });
                }
            };

            reader.onerror = () => {
                resolve({ success: false, message: 'Failed to read file.', count: 0 });
            };

            reader.readAsText(file);
        });
    },

    /**
     * Clears all EV Mate keys from LocalStorage.
     * Returns count of keys removed.
     */
    clearAllData: () => {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (EV_MATE_PREFIXES.some(prefix => key.startsWith(prefix))) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
        return keysToRemove.length;
    },

    /**
     * Returns a summary of data currently in LocalStorage.
     */
    getDataSummary: () => {
        const data = dataService.collectAllData();
        const keys = Object.keys(data);

        const vehicleKeys = keys.filter(k => k.startsWith('ev_mate_vehicles_'));
        const tripKeys = keys.filter(k => k.startsWith('ev_mate_trips_'));
        const chargingKeys = keys.filter(k => k.startsWith('ev_mate_charging_'));
        const maintenanceKeys = keys.filter(k => k.startsWith('ev_mate_maintenance_'));

        let totalTrips = 0, totalCharges = 0, totalMaint = 0, totalVehicles = 0;

        vehicleKeys.forEach(k => {
            const arr = data[k];
            if (Array.isArray(arr)) totalVehicles += arr.length;
        });
        tripKeys.forEach(k => {
            const arr = data[k];
            if (Array.isArray(arr)) totalTrips += arr.length;
        });
        chargingKeys.forEach(k => {
            const arr = data[k];
            if (Array.isArray(arr)) totalCharges += arr.length;
        });
        maintenanceKeys.forEach(k => {
            const arr = data[k];
            if (Array.isArray(arr)) totalMaint += arr.length;
        });

        return {
            totalKeys: keys.length,
            vehicles: totalVehicles,
            trips: totalTrips,
            charges: totalCharges,
            maintenance: totalMaint
        };
    }
};
