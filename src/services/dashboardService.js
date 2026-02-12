import { tripService } from './tripService';
import { chargingService } from './chargingService';
import { maintenanceService } from './maintenanceService';

export const dashboardService = {
    getAggregatedStats: (vehicleId) => {
        const trips = tripService.getTrips(vehicleId);
        const charges = chargingService.getChargingLogs(vehicleId);
        const maintenance = maintenanceService.getLogs(vehicleId);

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Helper to check date ranges
        const isWithin = (dateStr, startDate) => {
            const d = new Date(dateStr);
            return d >= startDate;
        };

        // Start Dates for ranges
        const oneWeekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        const periods = {
            weekly: { label: 'Last 7 Days', filter: (d) => isWithin(d, oneWeekAgo) },
            monthly: { label: 'This Month', filter: (d) => isWithin(d, startOfMonth) },
            yearly: { label: 'This Year', filter: (d) => isWithin(d, startOfYear) },
            all: { label: 'All Time', filter: () => true }
        };

        const stats = {};

        Object.keys(periods).forEach(key => {
            const filterFn = periods[key].filter;

            // Filter Data
            const pTrips = trips.filter(t => filterFn(t.date));
            const pCharges = charges.filter(c => filterFn(c.date));
            const pMaint = maintenance.filter(m => filterFn(m.date));

            // Aggregations
            const distance = pTrips.reduce((sum, t) => sum + (parseFloat(t.distance) || 0), 0);
            const energy = pTrips.reduce((sum, t) => sum + (parseFloat(t.batteryConsumed) || 0), 0);

            // Charging Cost
            // Note: Charging logs have 'amount' (public/home calculated)
            const chargingCost = pCharges.reduce((sum, c) => sum + (parseFloat(c.amount) || 0), 0);

            // Maintenance Cost
            const maintenanceCost = pMaint.reduce((sum, m) => sum + (parseFloat(m.cost) || 0), 0);

            // Derived Metrics
            const efficiency = energy > 0 ? (distance / energy) : 0;
            const totalExpense = chargingCost + maintenanceCost;

            // Avg Charging Cost / KM
            const runningCostPerKm = distance > 0 ? (chargingCost / distance) : 0;

            // TCO / KM
            const tcoPerKm = distance > 0 ? (totalExpense / distance) : 0;

            stats[key] = {
                distance: distance.toFixed(1),
                energy: energy.toFixed(1),
                efficiency: efficiency.toFixed(2),
                chargingCost: chargingCost.toFixed(0),
                maintenanceCost: maintenanceCost.toFixed(0),
                totalExpense: totalExpense.toFixed(0),
                runningCostPerKm: runningCostPerKm.toFixed(2),
                tcoPerKm: tcoPerKm.toFixed(2)
            };
        });

        return stats;
    }
};
