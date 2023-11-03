main();

function main() {
    const el = document.getElementById('chart');
    const baseTime = 0;
    const scales = [
        { id: '1', min: 0, max: 1000 },
        { id: '2', min: 0, max: 100 },
        { id: '3', min: 0, max: 100 },
        { id: '4', min: 0, max: 100 },
    ]
    const data1 = [
      {x: baseTime, y: 0 },
      {x: baseTime + (1000 * 14), y: 100 },
      {x: baseTime + (1000 * 24), y: 0 },
      {x: baseTime + (1000 * 44), y: 100 },
      {x: baseTime + (1000 * 64), y: 0 },
      {x: baseTime + (1000 * 84), y: 100 },
      {x: baseTime + (1000 * 104), y: 0 },
      {x: baseTime + (1000 * 124), y: 1000 },
      {x: baseTime + (1000 * 144), y: 0 },
    ];
    const data2 = [
        {x: baseTime, y: 0 },
        {x: baseTime + (1000 * 10), y: 10 },
        {x: baseTime + (1000 * 20), y: 0 },
        {x: baseTime + (1000 * 40), y: 10 },
        {x: baseTime + (1000 * 60), y: 0 },
        {x: baseTime + (1000 * 80), y: 10 },
        {x: baseTime + (1000 * 100), y: 0 },
        {x: baseTime + (1000 * 120), y: 100 },
        {x: baseTime + (1000 * 140), y: 0 },
        //{x: baseTime + (1000 * 160), y: 99 },
       // {x: baseTime + (1000 * 180), y: 1 },
    ];
    const data3 = [
        {x: baseTime, y: 0 },
        {x: baseTime + (1000 * 10), y: 10 },
        {x: baseTime + (1000 * 20), y: 0 },
        {x: baseTime + (1000 * 40), y: 10 },
        {x: baseTime + (1000 * 60), y: 0 },
        {x: baseTime + (1000 * 80), y: 10 },
        {x: baseTime + (1000 * 100), y: 0 },
        {x: baseTime + (1000 * 120), y: 100 },
        {x: baseTime + (1000 * 140), y: 0 },
        //{x: baseTime + (1000 * 160), y: 99 },
       // {x: baseTime + (1000 * 180), y: 1 },
    ];
   
    const chart = new TimeChart(el, {
        // debugWebGL: true,
        // forceWebGL1: true,
        baseTime,
        series: [
            {
                name: '1',
                data: data1,
                color: 'blue',
                rangeId: '1',
            },
            {
                name: '2',
                data: data2,
                lineWidth: 1,
                color: 'red',
                rangeId: '2',
            },
            {
                name: '3',
                data: data3,
                lineWidth: 1,
                color: 'green',
                rangeId: '3',
            },
            {
                name: '4',
                data: data3,
                lineWidth: 1,
                color: 'green',
                rangeId: '4',
            },
        ],
        xRange: { min: 0, max: 1000 * 1000 },
        yRange: { min: 0, max: 100 },
        yRanges:  scales,
        realTime: true,
        zoom: {
            x: {
                autoRange: true,
                minDomainExtent: 50,
            },
            y: {
                autoRange: true,
                minDomainExtent: 1,
            }
        },
        legend: false,
        
        tooltip: {
            enabled: true,
            xFormatter: (x) => new Date(x + baseTime).toLocaleString([], {hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3}),
        },
    });
  
    document.getElementById('stop-btn').addEventListener('click', function () {
        clearInterval(ev);
    });
    document.getElementById('follow-btn').addEventListener('click', function () {
        chart.options.realTime = true;
    });
    document.getElementById('legend-btn').addEventListener('click', function () {
        chart.options.legend = !chart.options.legend;
        chart.update();
    });
    document.getElementById('tooltip-btn').addEventListener('click', function () {
        chart.options.tooltip.enabled = !chart.options.tooltip.enabled;
    });

    paddingDirs = ['Top', 'Right', 'Bottom', 'Left'];
    for (const d of paddingDirs) {
        const i = document.getElementById('padding-' + d.toLowerCase());
        const propName = 'padding' + d
        i.textContent = chart.options[propName];
    }
    for (const d of paddingDirs) {
        /** @type {HTMLInputElement} */
        const i = document.getElementById('render-padding-' + d.toLowerCase());
        const propName = 'renderPadding' + d
        i.value = chart.options[propName];
        i.addEventListener('change', () => {
            chart.options[propName] = parseFloat(i.value);
            chart.update();
        });
    }
}
