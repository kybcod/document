let chartInstances = {};  // 차트 인스턴스를 저장할 객체
let chartLastInfo = {}; // 차트별 마지막 데이터 시/분을 저장할 객체
let VISIBLE_COUNT = 15;

function getMonitoringInfo() {
    $.ajax({
        url: "monitoring",
        type: "POST",
        contentType: "application/json",
        dataType: "json",
        success: function (res) {
            const totalCount = res.totalCnt || 0;
            const succCnt = res.succCnt || 0;
            const failCnt = res.failCnt || 0;
            const dbmsList = res.dbmsList; // 개별 DB 상태 리스트

            // 1. 도넛 차트 업데이트 로직
            const doughnutData = [];
            if (succCnt > 0) {
                doughnutData.push({ argument: 'Success', value: succCnt });
            }
            if (failCnt > 0 || succCnt === 0) {
                doughnutData.push({ argument: 'Fail', value: failCnt });
            }

            doughnutChart(doughnutData, totalCount);

            // 2. 개별 라인 차트 업데이트 로직
            dbmsList.forEach(item => {
                if (!chartInstances[item.name]) {
                    // 차트가 없으면 새로 생성
                    createChart(item);
                } else {
                    // 차트가 있으면 데이터를 추가
                    updateChart(item);
                }
            });
        },
        error: function (err) {
            console.error("모니터링 정보 요청 실패", err);
        }
    });
}

/* 차트 만들기 */
function createChart(item) {
    const containerId = `${item.name}Chart`;
    const dataSource = [
        {
            time: item.time, // 최초 데이터 포함
            status: parseInt(item.status)
        }
    ];

    // 새 차트 div 생성
    if (!$(`#${containerId}`).length) {
        $('.chart_container').append(`<div id="${containerId}" style="width:400px; height:300px; margin:10px; border:1px solid #ccc;"></div>`);
    }

    let line = new dxchart();

    line.setDataSource(dataSource);
    line.setCommonSeriesSettings(0, 'time', 'spline'); // x축: 'time', barPadding: 0으로 수정하여 선 차트에 맞춤
    line.setSeries(['status'], ['Status'], ['#007bff'], [null]); // y축: 'status'
    line.setValueTickInterval(1);
    line.setEndOnTick(0.1, 0.1, false);

    line.setTooltip(true);
    line.setLegend('top', 'right', 10, false);
    line.setTitle(item.name);

    line.setScrollBar(true, 5, 'lightgray');
    line.setZoomAndPan('pan', 'none');
    line.setArgumentVisualRange(VISIBLE_COUNT);
    line.setAnimation(true, 1000);

    const chartInstance = $(`#${containerId}`).dxChart(line).dxChart("instance");
    chartInstances[item.name] = chartInstance;
}


function updateChart(item) {
    const chart = chartInstances[item.name];
    if (chart) {
        const now = new Date();
        const currentVal = now.getHours();

        if (!chartLastInfo[item.name]) {
            chartLastInfo[item.name] = {};
        }
        const lastVal = chartLastInfo[item.name];

        let currentData = chart.option("dataSource");

        // 분 또는 시가 바뀌었는지 확인
        if (lastVal !== undefined && lastVal !== currentVal) {
            currentData = []; // 데이터 리셋
        }

        // 마지막 시간/분 정보 업데이트
        chartLastInfo[item.name] = currentVal;

        // 새 데이터 추가
        currentData.push({
            time: item.time,
            status: parseInt(item.status)
        });

        // 데이터 소스 갱신
        chart.option("dataSource", currentData);

        // 자동 스크롤 로직
        if (currentData.length > VISIBLE_COUNT) {
            const newVisibleRange = {
                startValue: currentData[currentData.length - VISIBLE_COUNT].time,
                endValue: currentData[currentData.length - 1].time
            };
            chart.option("argumentAxis.visualRange", newVisibleRange);
        }
    }
}

function doughnutChart(doughnutData, totalCount) {

    if (!$(`#doughnutChart`).length) {
        $('.chart_container').append(`<div id="doughnutChart" style="width:400px; height:300px; margin:10px; border:1px solid #ccc;"></div>`);
    }

    let palette;
    if (doughnutData[0].argument === 'Fail') {
        palette = ['#F44336'];
    } else {
        palette = ['#4CAF50', '#F44336'];
    }

    let doughnut = new dxPieChart();

    doughnut.legend = {
        font: {
            size: 15,
            weight: 'bold'
        }
    };
    doughnut.setDataSource(doughnutData);
    doughnut.setType('doughnut');
    doughnut.setPalette(palette);
    doughnut.setSeries('argument', 'value', 'fixedPoint', 0, true, '', '건');
    doughnut.setTooltip(true, 'fixedPoint', 0, 15);
    doughnut.setInnerRadius(0.8);
    doughnut.setCenterTemplate(function(pieChart, container) {
        const totalText = container.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "text"));
        totalText.textContent = totalCount;
        totalText.setAttribute("x", "50%");
        totalText.setAttribute("y", "50%");
        totalText.setAttribute("dy", "-5px");
        totalText.setAttribute("text-anchor", "middle");
        totalText.setAttribute("dominant-baseline", "middle");
        totalText.setAttribute("style", "font-size: 30px; font-weight: bold; fill: black;");

        const subText = container.appendChild(document.createElementNS("http://www.w3.org/2000/svg", "text"));
        subText.textContent = "Total";
        subText.setAttribute("x", "50%");
        subText.setAttribute("y", "50%");
        subText.setAttribute("dy", "20px");
        subText.setAttribute("text-anchor", "middle");
        subText.setAttribute("dominant-baseline", "middle");
        subText.setAttribute("style", "font-size: 14px; fill: #888;");
    });


    $('#doughnutChart').dxPieChart(doughnut);
}