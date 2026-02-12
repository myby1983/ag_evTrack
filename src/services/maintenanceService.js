export const maintenanceService = {
    getLogs: (vehicleId) => {
        const logs = localStorage.getItem(`ev_mate_maintenance_${vehicleId}`);
        return logs ? JSON.parse(logs) : [];
    },

    addLog: (vehicleId, logData) => {
        const logs = maintenanceService.getLogs(vehicleId);
        const newLog = {
            ...logData,
            id: Date.now().toString(),
            vehicleId,
            createdAt: new Date().toISOString()
        };

        logs.push(newLog);
        localStorage.setItem(`ev_mate_maintenance_${vehicleId}`, JSON.stringify(logs));
        return newLog;
    },

    updateLog: (vehicleId, logId, updatedData) => {
        const logs = maintenanceService.getLogs(vehicleId);
        const index = logs.findIndex(l => l.id === logId);
        if (index !== -1) {
            logs[index] = { ...logs[index], ...updatedData };
            localStorage.setItem(`ev_mate_maintenance_${vehicleId}`, JSON.stringify(logs));
            return logs[index];
        }
        return null;
    },

    deleteLog: (vehicleId, logId) => {
        const logs = maintenanceService.getLogs(vehicleId);
        const filtered = logs.filter(l => l.id !== logId);
        localStorage.setItem(`ev_mate_maintenance_${vehicleId}`, JSON.stringify(filtered));
    }
};
