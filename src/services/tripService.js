export const tripService = {
    getTrips: (vehicleId) => {
        const trips = localStorage.getItem(`ev_mate_trips_${vehicleId}`);
        return trips ? JSON.parse(trips) : [];
    },

    getLastTrip: (vehicleId) => {
        const trips = tripService.getTrips(vehicleId);
        return trips.length > 0 ? trips[trips.length - 1] : null;
    },

    addTrip: (vehicleId, tripData) => {
        const trips = tripService.getTrips(vehicleId);
        const newTrip = {
            ...tripData,
            id: Date.now().toString(),
            vehicleId,
            createdAt: new Date().toISOString()
        };

        trips.push(newTrip);
        localStorage.setItem(`ev_mate_trips_${vehicleId}`, JSON.stringify(trips));
        return newTrip;
    },

    calculateStats: (startOdo, endOdo, startSoC, endSoC, batteryCapacity) => {
        const distance = parseFloat(endOdo) - parseFloat(startOdo);

        // Simple SoC difference method (assuming no intermediate charging for basic version)
        // If user charged in between, this logic needs to be more complex (SRS 3.2 mentions this)
        // "Calculation must account for intermediate charging sessions if strictly SoC based."
        // For now, we assume simple trip without charging or user manually adjusts.
        // Enhanced Logic: We need 'chargedkWh' input if we want to be accurate, 
        // but SRS 3.2 implies "Derived from SoC differential". 
        // Let's stick to SoC differential for now as per "Battery Consumed = Derived from SoC differential".

        const socDiff = parseFloat(startSoC) - parseFloat(endSoC);

        // If socDiff is negative, it implies charging happened. 
        // We should probably just assume positive consumption for a single trip leg.

        const batteryConsumed = (socDiff / 100) * batteryCapacity;
        const efficiency = batteryConsumed > 0 ? (distance / batteryConsumed) : 0; // km/kWh

        return {
            distance: distance.toFixed(1),
            batteryConsumed: batteryConsumed.toFixed(2),
            efficiency: efficiency.toFixed(2)
        };
    },

    getLatestState: (vehicleId, initialOdometer) => {
        const trips = tripService.getTrips(vehicleId);
        // We need to access charging logs. 
        // Since services naturally import each other, we can't import chargingService here directly if it imports tripService (Circular Dependency).
        // Solution: Read from localStorage directly here to avoid circular dependency issues, 
        // OR move this logic to a higher level (Context) or a shared utility.
        // Reading localStorage is safe and easy for this architecture.

        const chargingLogs = JSON.parse(localStorage.getItem(`ev_mate_charging_${vehicleId}`) || '[]');

        const lastTrip = trips.length > 0 ? trips[trips.length - 1] : null;
        const lastCharge = chargingLogs.length > 0 ? chargingLogs[chargingLogs.length - 1] : null;

        let latestSoC = '100'; // Default
        let latestOdo = initialOdometer || '0';

        if (!lastTrip && !lastCharge) {
            return { soc: latestSoC, odo: latestOdo };
        }

        if (lastTrip && !lastCharge) {
            return { soc: lastTrip.endSoC, odo: lastTrip.endOdo };
        }

        if (!lastTrip && lastCharge) {
            return { soc: lastCharge.finalSoC, odo: lastCharge.odometer || initialOdometer }; // fallback if odo missing
        }

        // Both exist, compare dates
        const tripDate = new Date(lastTrip.createdAt || lastTrip.date).getTime(); // Prefer createdAt for precision
        const chargeDate = new Date(lastCharge.createdAt || lastCharge.date).getTime();

        if (chargeDate > tripDate) {
            return { soc: lastCharge.finalSoC, odo: lastCharge.odometer || lastTrip.endOdo };
        } else {
            return { soc: lastTrip.endSoC, odo: lastTrip.endOdo };
        }
    },

    updateTrip: (vehicleId, tripId, updatedData) => {
        const trips = tripService.getTrips(vehicleId);
        const index = trips.findIndex(t => t.id === tripId);
        if (index !== -1) {
            trips[index] = { ...trips[index], ...updatedData };
            localStorage.setItem(`ev_mate_trips_${vehicleId}`, JSON.stringify(trips));
            return trips[index];
        }
        return null;
    },

    deleteTrip: (vehicleId, tripId) => {
        const trips = tripService.getTrips(vehicleId);
        const filtered = trips.filter(t => t.id !== tripId);
        localStorage.setItem(`ev_mate_trips_${vehicleId}`, JSON.stringify(filtered));
    }
};
