(function ($) {

	var icChartlist = function () {

		var screenWidth = $(window).width();
		var totalInvoices = function () {
			var options = {
				series: [
					{
						name: 'Net Profit',
						data: [100, 300, 200, 400, 200],
						/* radius: 30,	 */
					},
				],
				chart: {

					type: 'area',
					height: 70,
					width: 100,

					toolbar: {
						show: false,
					},
					zoom: {
						enabled: false
					},
					sparkline: {
						enabled: true
					}

				},

				colors: ['var(--primary)'],
				dataLabels: {
					enabled: false,
				},

				legend: {
					show: false,
				},
				stroke: {
					show: true,
					width: 3,
					curve: 'smooth',
					colors: ['var(--primary)'],
				},

				grid: {
					show: false,
					borderColor: '#eee',
					padding: {
						top: 0,
						right: 0,
						bottom: 0,
						left: 0

					}
				},
				states: {
					normal: {
						filter: {
							type: 'none',
							value: 0
						}
					},
					hover: {
						filter: {
							type: 'none',
							value: 0
						}
					},
					active: {
						allowMultipleDataPointsSelection: false,
						filter: {
							type: 'none',
							value: 0
						}
					}
				},
				xaxis: {
					categories: ['Jan', 'feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug'],
					axisBorder: {
						show: false,
					},
					axisTicks: {
						show: false
					},
					labels: {
						show: false,
						style: {
							fontSize: '12px',
						}
					},

					crosshairs: {
						show: false,
						position: 'front',
						stroke: {
							width: 1,
							dashArray: 3
						}
					},
					tooltip: {
						enabled: true,
						formatter: undefined,
						offsetY: 0,
						style: {
							fontSize: '12px',
						}
					}
				},
				yaxis: {
					show: false,
				},
				fill: {
					type: 'gradient',
					opacity: 0.7,
					colors: 'var(--primary)',
					gradient: {
						colorStops: [

							{
								offset: 0,
								color: 'var(--primary)',
								opacity: .4
							},
							{
								offset: 0.6,
								color: 'var(--primary)',
								opacity: .4
							},
							{
								offset: 100,
								color: 'white',
								opacity: 0
							}
						],
					},
				},

				tooltip: {
					enabled: false,
					style: {
						fontSize: '12px',
					},
					y: {
						formatter: function (val) {
							return "$" + val + " thousands"
						}
					}
				}

			};

			if(document.querySelector("#totalInvoices") !== null) {
				var chartBar1 = new ApexCharts(document.querySelector("#totalInvoices"), options);
				chartBar1.render();
			}

		}
		var totalInvoices1 = function () {
			var options = {
				series: [
					{
						name: 'Net Profit',
						data: [100, 300, 200, 400, 200],
						/* radius: 30,	 */
					},
				],
				chart: {

					type: 'area',
					height: 70,
					width: 100,

					toolbar: {
						show: false,
					},
					zoom: {
						enabled: false
					},
					sparkline: {
						enabled: true
					}

				},

				colors: ['var(--primary)'],
				dataLabels: {
					enabled: false,
				},

				legend: {
					show: false,
				},
				stroke: {
					show: true,
					width: 3,
					curve: 'smooth',
					colors: ['var(--primary)'],
				},

				grid: {
					show: false,
					borderColor: '#eee',
					padding: {
						top: 0,
						right: 0,
						bottom: 0,
						left: 0

					}
				},
				states: {
					normal: {
						filter: {
							type: 'none',
							value: 0
						}
					},
					hover: {
						filter: {
							type: 'none',
							value: 0
						}
					},
					active: {
						allowMultipleDataPointsSelection: false,
						filter: {
							type: 'none',
							value: 0
						}
					}
				},
				xaxis: {
					categories: ['Jan', 'feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug'],
					axisBorder: {
						show: false,
					},
					axisTicks: {
						show: false
					},
					labels: {
						show: false,
						style: {
							fontSize: '12px',
						}
					},

					crosshairs: {
						show: false,
						position: 'front',
						stroke: {
							width: 1,
							dashArray: 3
						}
					},
					tooltip: {
						enabled: true,
						formatter: undefined,
						offsetY: 0,
						style: {
							fontSize: '12px',
						}
					}
				},
				yaxis: {
					show: false,
				},
				fill: {
					type: 'gradient',
					opacity: 0.7,
					colors: 'var(--primary)',
					gradient: {
						colorStops: [

							{
								offset: 0,
								color: 'var(--primary)',
								opacity: .4
							},
							{
								offset: 0.6,
								color: 'var(--primary)',
								opacity: .4
							},
							{
								offset: 100,
								color: 'white',
								opacity: 0
							}
						],
					},
				},

				tooltip: {
					enabled: false,
					style: {
						fontSize: '12px',
					},
					y: {
						formatter: function (val) {
							return "$" + val + " thousands"
						}
					}
				}

			};

			if(document.querySelector("#totalInvoices-1") !== null) {
				var chartBar1 = new ApexCharts(document.querySelector("#totalInvoices-1"), options);
				chartBar1.render();
			}

		}
		var pieChart = function () {
			var options = {
				series: [60, 40],
				chart: {
					type: 'donut',
					width: '100'
				},
				legend: {
					show: false,

				},
				plotOptions: {
					pie: {
						offsetY: 10,
						offsetX: 25, // Adjust the horizontal offset of the pie slices
					}
				},
				colors: ['var(--rgba-primary-1)', 'var(--primary)'],
				dataLabels: {
					enabled: false, // enable data labels
				},
				responsive: [{
					breakpoint: 480,
					options: {
						chart: {
							width: 200
						},
						legend: {
							position: 'bottom'
						}
					}
				}]
			};

			if(document.querySelector("#chart") !== null) {
				var chart = new ApexCharts(document.querySelector("#chart"), options);
				chart.render();
			}


		}
		var pieChartOne = function () {
			var options = {
				series: [60, 30],
				chart: {
					type: 'donut',
					width: '100'
				},
				legend: {
					show: false,

				},
				plotOptions: {
					pie: {
						offsetY: 10,
						offsetX: 25, // Adjust the horizontal offset of the pie slices
					}
				},
				colors: ['var(--rgba-primary-1)', 'var(--primary)'],
				dataLabels: {
					enabled: false, // enable data labels
				},
				responsive: [{
					breakpoint: 480,
					options: {
						chart: {
							width: 200
						},
						legend: {
							position: 'bottom'
						}
					}
				}]
			};

			if(document.querySelector("#chart-1") !== null) {
				var chart = new ApexCharts(document.querySelector("#chart-1"), options);
				chart.render();
			}
		}

		var EarningsPrediction = function () {
			var options = {
				series: [
					{
						name: "2024",
						data: [3.3, 3.6, 2, 1.4, 1.2, 1.8, 1.1, 1.4, 1.5,1.3, 3.6, 2,],
					},
					{
						name: "2023",
						data: [-2.6, -2.1, -3.5, -2.5, -1.3, -1.8, -2, -1.1, -1.4,-2.1, -3.5, -2.5,],
					},
				],
				chart: {
					toolbar: {
						show: false,
					},
					type: "bar",
					fontFamily: "inherit",
					foreColor: "#adb0bb",
					height: 300,
					stacked: true,
					offsetX: -15,
				},
				colors: ["var(--bs-primary)", "#01bd9b"],
				plotOptions: {
					bar: {
						horizontal: false,
						barHeight: "80%",
						columnWidth: "15%",
						borderRadius: [6],
						borderRadiusApplication: "end",
						borderRadiusWhenStacked: "all",
					},
				},
				dataLabels: {
					enabled: false,
				},
				legend: {
					show: false,
				},
				grid: {
					show: true,
					padding: {
						top: 0,
						bottom: 0,
						right: 0,
					},
					borderColor: "rgba(0,0,0,0.05)",
					xaxis: {
						lines: {
							show: true,
						},
					},
					yaxis: {
						lines: {
							show: true,
						},
					},
				},
				yaxis: {
					min: -5,
					max: 5,
				},
				xaxis: {
					axisBorder: {
						show: false,
					},
					axisTicks: {
						show: false,
					},
					categories: [
						"Jan",
						"Feb",
						"Mar",
						"Apr",
						"May",
						"Jun",
						"July",
						"Aug",
						"Sep",
						"Oct",
						"Nov",
						"Dec",
					],
					labels: {
						style: { fontSize: "13px", colors: "#adb0bb", fontWeight: "400" },
					},
				},
				yaxis: {
					tickAmount: 4,
				},
				tooltip: {
					theme: "dark",
				},

			};

			if(document.querySelector("#EarningsPrediction") !== null) {
				var chart = new ApexCharts(document.querySelector("#EarningsPrediction"), options);
				chart.render();
			}
		}

		/* Function ============ */
		return {
			init: function () {
			},


			load: function () {
				totalInvoices();
				totalInvoices1();
				pieChart();
				pieChartOne();
				EarningsPrediction();


			},

			resize: function () {
			}
		}

	}();



	jQuery(window).on('load', function () {
		setTimeout(function () {
			icChartlist.load();
		}, 1000);

	});



})(jQuery);