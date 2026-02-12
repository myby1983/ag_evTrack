export const EV_MASTER_DATA = {
    brands: [
        { id: 'tata', name: 'Tata Motors' },
        { id: 'mg', name: 'MG Motor' },
        { id: 'hyundai', name: 'Hyundai' },
        { id: 'kia', name: 'Kia' },
        { id: 'byd', name: 'BYD' },
        { id: 'mahindra', name: 'Mahindra' }
    ],
    models: {
        tata: [
            { id: 'nexon_ev_prime', name: 'Nexon EV Prime', battery: 30.2 },
            { id: 'nexon_ev_max', name: 'Nexon EV Max', battery: 40.5 },
            { id: 'nexon_ev_45', name: 'Nexon EV 45', battery: 45 },
            { id: 'tiago_ev_mr', name: 'Tiago EV MR', battery: 19.2 },
            { id: 'tiago_ev_lr', name: 'Tiago EV LR', battery: 24 },
            { id: 'tigor_ev', name: 'Tigor EV', battery: 26 },
            { id: 'punch_ev_mr', name: 'Punch EV MR', battery: 25 },
            { id: 'punch_ev_lr', name: 'Punch EV LR', battery: 35 },
            { id: 'curvv_ev_45', name: 'Curvv EV 45', battery: 45 },
            { id: 'curvv_ev_55', name: 'Curvv EV 55', battery: 55 }
        ],
        mg: [
            { id: 'zs_ev', name: 'ZS EV', battery: 50.3 },
            { id: 'comet', name: 'Comet EV', battery: 17.3 },
            { id: 'windsor', name: 'Windsor EV', battery: 38 }
        ],
        hyundai: [
            { id: 'kona', name: 'Kona Electric', battery: 39.2 },
            { id: 'ioniq5', name: 'IONIQ 5', battery: 72.6 }
        ],
        kia: [
            { id: 'ev6', name: 'EV6', battery: 77.4 }
        ],
        byd: [
            { id: 'atto3', name: 'Atto 3', battery: 60.48 },
            { id: 'seal', name: 'Seal', battery: 82.56 }
        ],
        mahindra: [
            { id: 'xuv400_34', name: 'XUV400 34kWh', battery: 34.5 },
            { id: 'xuv400_39', name: 'XUV400 39kWh', battery: 39.4 }
        ]
    },
    chargerOptions: [
        { value: 3.3, label: '3.3 kW (Portable)' },
        { value: 3.5, label: '3.5 kW (AC Wallbox)' },
        { value: 7.5, label: '7.5 kW (AC Fast)' },
        { value: 11, label: '11 kW + (Three Phase)' }
    ]
};
