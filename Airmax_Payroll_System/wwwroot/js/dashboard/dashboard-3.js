(function ($) {

	var icChartlist = function () {

		var screenWidth = $(window).width();

		var columnChart = function () {
			var options = {
				series: [
					{
						name: "2024",
						data: [1.2, 2.7, 1, 3.6, 1, 3.6, 3.6,],
					},
					{
						name: "2023",
						data: [-2.8, -1.1, -2.5, -1.5, -2.8, -1.1, -1.1,],
					},
				],
				chart: {
					toolbar: {
						show: false,
					},
					type: "bar",
					fontFamily: "inherit",
					foreColor: "#adb0bb",
					height: 200,
					stacked: true,
					offsetX: -15,
				},
				colors: ["var(--bs-primary)", "#01bd9b",],
				plotOptions: {
					bar: {
						horizontal: false,
						barHeight: "60%",
						columnWidth: "30%",
						borderRadius: [5],
						borderRadiusApplication: "start",
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
					show: false,
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
					show: false,
					min: -5,
					max: 5,
				},
				xaxis: {
					show: false,
					axisBorder: {
						show: false,
					},
					axisTicks: {
						show: false,
					},
					categories: [
						"Sun",
						"Mon",
						"Tue",
						"Wed",
						"Thu",
						"Fri",
						"Sat",
					],
					labels: {
						style: { fontSize: "13px", colors: "#adb0bb", fontWeight: "400" },
					},
				},
				yaxis: {
					show: false,
					tickAmount: 4,
				},
				tooltip: {
					theme: "dark",
				},
			};


			if(document.querySelector("#columnChart") !== null) {
				var chart = new ApexCharts(document.querySelector("#columnChart"), options);
				chart.render();
			}

		}

		var AllProject = function () {
			var options = {
				series: [12, 30, 20],
				chart: {
					type: 'donut',
					width: 150,
				},
				plotOptions: {
					pie: {
						donut: {
							size: '80%',
							labels: {
								show: true,
								name: {
									show: true,
									offsetY: 12,
								},
								value: {
									show: true,
									fontSize: '22px',
									fontFamily: 'Arial',
									fontWeight: '500',
									offsetY: -17,
								},
								total: {
									show: true,
									fontSize: '11px',
									fontWeight: '500',
									fontFamily: 'Arial',
									label: 'Compete',

									formatter: function (w) {
										return w.globals.seriesTotals.reduce((a, b) => {
											return a + b
										}, 0)
									}
								}
							}
						}
					}
				},
				legend: {
					show: false,
				},
				colors: ['#3AC977', 'var(--primary)', 'var(--secondary)'],
				labels: ["Compete", "Pending", "Not Start"],
				dataLabels: {
					enabled: false,
				},
			};
			if(document.querySelector("#AllProject") !== null) {
				var chartBar1 = new ApexCharts(document.querySelector("#AllProject"), options);
				chartBar1.render();
			}

		}
		var Schedules = function () {
			var weekly = {
				series: [
					{
						data: [
							{
								x: "Mon",
								y: [
									new Date("2024-02-27").getTime(),
									new Date("2024-03-04").getTime(),
								],
								fillColor: "var(--bs-primary)",
							},
							{
								x: "Tue",
								y: [
									new Date("2024-03-04").getTime(),
									new Date("2024-03-10").getTime(),
								],
								fillColor: "var(--bs-secondary)",
							},
							{
								x: "Wed",
								y: [
									new Date("2024-03-01").getTime(),
									new Date("2024-03-06").getTime(),
								],
								fillColor: "#f09744",
							},
						],
					},
				],
				chart: {
					id: "sparkline3",
					type: "rangeBar",
					fontFamily: "inherit",
					foreColor: "#adb0bb",
					height: 250,
					toolbar: {
						show: false,
					},
				},
				plotOptions: {
					bar: {
						horizontal: true,
						distributed: true,
						borderRadius: 20,
						barHeight: '70%',
						dataLabels: {
							hideOverflowingLabels: false,
						},
					},
				},
				dataLabels: {
					enabled: true,
					background: {
						borderRadius: 30,
					},
					formatter: function (val, opts) {
						var label = opts.w.globals.labels[opts.dataPointIndex];
						var a = moment(val[0]);
						var b = moment(val[1]);

						return label + ": " + "Meeting with Kuldeep";
					},
				},
				xaxis: {
					type: "datetime",
					axisBorder: {
						show: false,
					},
					axisTicks: {
						show: false,
					},
					labels: {
						style: { fontSize: "13px", colors: "#adb0bb", fontWeight: "400" },
					},
				},
				yaxis: {
					axisBorder: {
						show: false,
					},
					axisTicks: {
						show: false,
					},
					labels: {
						style: { fontSize: "13px", colors: "#adb0bb", fontWeight: "400" },
					},
				},
				grid: {
					borderColor: "rgba(0,0,0,0.05)",
				},
				tooltip: {
					theme: "dark",
				},
			};
			if(document.querySelector("#schedules") !== null) {
				new ApexCharts(document.querySelector("#schedules"), weekly).render();
			}


		}

		var NewExperience = function () {
			var options = {
				series: [
					{
						name: 'Net Profit',
						data: [100, 300, 200, 250, 200, 240, 180, 230, 200, 250, 300],
						/* radius: 30,	 */
					},
				],
				chart: {
					type: 'area',
					height: 100,
					//width: 400,
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
					width: 2,
					curve: 'straight',
					colors: ['var(--primary)'],
				},

				grid: {
					show: false,
					borderColor: '#eee',
					padding: {
						top: 0,
						right: 0,
						bottom: 0,
						left: -1

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
					categories: ['Jan', 'feb', 'Mar', 'Apr', 'May', 'June', 'July', 'August', 'Sept', 'Oct'],
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
					opacity: 0.9,
					colors: 'var(--primary)',
					type: 'gradient',
					gradient: {
						colorStops: [

							{
								offset: 0,
								color: 'var(--primary)',
								opacity: .5
							},
							{
								offset: 0.6,
								color: 'var(--primary)',
								opacity: .5
							},
							{
								offset: 100,
								color: 'white',
								opacity: 0
							}
						],

					}
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

			if(document.querySelector("#NewExperience") !== null) {
				var chartBar1 = new ApexCharts(document.querySelector("#NewExperience"), options);
				chartBar1.render();
			}

		}
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
					height: 100,
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
		var pieChart = function () {
			var options = {
				series: [60, 40],
				chart: {
					type: 'donut',
					width: '150'
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
		var VisitorsChart = function () {
			var options = {
				series: [
					{
						name: 'Net Profit',
						data: [40, 90, 36, 12, 44, 25, 59, 41, 66, 25],
					},
				],
				chart: {
					type: 'bar',
					height: 60,
					toolbar: {
						show: false,
					},
					zoom: {
						enabled: false
					},
					sparkline: {
						enabled: true
					},


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
					width: 2,
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
				x: {
					categories: ['Jan', 'feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct'],
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
				y: {
					show: false,
				},
				tooltip: {
					enabled: true,
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

			if(document.querySelector("#VisitorsChart") !== null) {
				var chartBar1 = new ApexCharts(document.querySelector("#VisitorsChart"), options);
				chartBar1.render();
			}

		}

		var sessionsChart = function () {
			var options = {
				series: [
					{
						name: 'Net Profit',
						data: [19, 9, 36, 12, 44, 25, 59, 41, 66, 25],
					},
				],
				chart: {
					type: 'line',
					height: 50,
					toolbar: {
						show: false,
					},
					zoom: {
						enabled: false
					},
					sparkline: {
						enabled: true
					},
				},

				colors: ['var(--secondary)'],
				dataLabels: {
					enabled: false,
				},

				legend: {
					show: false,
				},
				stroke: {
					show: true,
					width: 2,
					curve: 'smooth',
					colors: ['var(--secondary)'],
					dropShadow: {
						enabled: true,
						top: 4,
						left: 4,
						blur: 4,
						opacity: 0.5
					}

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
				x: {
					categories: ['Jan', 'feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct'],
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
				y: {
					show: false,
				},
				tooltip: {
					enabled: true,
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

			if(document.querySelector("#sessionsChart ") !== null) {
				var chartBar1 = new ApexCharts(document.querySelector("#sessionsChart "), options);
				chartBar1.render();
			}

		}
		var LiveChart = function () {
			var options = {
				series: [
					{
						name: 'Net Profit',
						data: [20, 18, 30, 12, 44, 25, 59, 41, 66, 25],
					},
				],
				chart: {
					type: 'line',
					height: 60,
					toolbar: {
						show: false,
					},
					zoom: {
						enabled: false
					},
					sparkline: {
						enabled: true
					},
				},

				colors: ['#58bad7'],
				dataLabels: {
					enabled: false,
				},

				legend: {
					show: false,
				},
				stroke: {
					show: true,
					width: 2,
					curve: 'smooth',
					colors: ['#58bad7'],
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
				x: {
					categories: ['Jan', 'feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct'],
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
							width: 2,
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
				y: {
					show: false,
				},
				tooltip: {
					enabled: true,
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

			if(document.querySelector("#LiveChart") !== null) {
				var chartBar1 = new ApexCharts(document.querySelector("#LiveChart"), options);
				chartBar1.render();
			}

		}
		var chartBarRunning = function(){
			var options  = {
				series: [
					{
						name: 'Income',
						 data: [31, 40, 28,31, 40, 28,31, 40, 28,31, 40, 28]
					}, 
					{
					  name: 'Expense',
					   data: [11, 32, 45,38, 25, 20,36, 45, 15,11, 32, 45]
					}, 
					
				],
				chart: {
				type: 'bar',
				height: 300,
				
				
				toolbar: {
					show: false,
				},
				
			},
			plotOptions: {
			  bar: {
				horizontal: false,
				endingShape:'rounded',
				columnWidth: '45%',
				borderRadius: 5,
				
			  },
			},
			colors:['#', '#77248B'],
			dataLabels: {
			  enabled: false,
			},
			markers: {
				shape: "circle",
			},
			legend: {
				show: false,
				fontSize: '12px',
				labels: {
					colors: '#000000',
					
					},
				markers: {
				width: 30,
				height: 30,
				strokeWidth: 0,
				strokeColor: '#fff',
				fillColors: undefined,
				radius: 35,	
				}
			},
			stroke: {
			  show: true,
			  width: 6,
			  colors: ['transparent']
			},
			grid: {
				borderColor: 'rgba(252, 252, 252,0.2)',
			},
			xaxis: {
			  categories: ['Jan', 'Feb', 'Mar','Apr','May','Jun','Jul','Aug', 'Sep', 'Oct','Nov','Dec'],
			  labels: {
				style: {
					colors: '#000',
					fontSize: '13px',
					fontFamily: 'poppins',
					fontWeight: 100,
					cssClass: 'apexcharts-xaxis-label',
					},		
			  },
			  axisBorder: {
				show: false,
			   },
			  axisTicks: {
				show: false,
				borderType: 'solid',
				color: '#78909C',
				height: 6,
				offsetX: 0,
				offsetY: 0
			},
			  crosshairs: {
			  show: false,
			  }
			},
			yaxis: {
				labels: {
					offsetX:-16,
				   style: {
					  colors: '#000',
					  fontSize: '13px',
					   fontFamily: 'poppins',
					  fontWeight: 100,
					  cssClass: 'apexcharts-xaxis-label',
				  },
			  },
			},
			fill: {
			  opacity: 1,
			  colors:['var(--primary)', '#FFD125'],
			},
			tooltip: {
			  y: {
				formatter: function (val) {
				  return "$ " + val + " thousands"
				}
			  }
			},
			 responsive: [{
				breakpoint: 575,
				options: {
					plotOptions: {
					  bar: {
						columnWidth: '1%',
						borderRadius: -1,
					  },
					},
					chart:{
						height:250,
					},
					series: [
						{
							name: 'Projects',
							 data: [31, 40, 28,31, 40, 28,31, 40]
						}, 
						{
						  name: 'Projects',
						   data: [11, 32, 45,31, 40, 28,31, 40]
						}, 
						
					],
				}
			 }]
			};
	
			if(jQuery("#chartBarRunning").length > 0){
	
				if(document.querySelector("#chartBarRunning") !== null) {
					var chart = new ApexCharts(document.querySelector("#chartBarRunning"), options);
					chart.render();
				}
				
				jQuery('#dzIncomeSeries').on('change',function(){
					jQuery(this).toggleClass('disabled');
					chart.toggleSeries('Income');
				});
				
				jQuery('#dzExpenseSeries').on('change',function(){
					jQuery(this).toggleClass('disabled');
					chart.toggleSeries('Expense');
				});
				
			}
				
		}

		var Statistics = function(){
		
			function generateDayWiseTimeSeries(baseval, count, yrange) {
				var i = 0;
				var series = [];
				while (i < count) {
					var x = baseval;
					var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
					series.push([x, y]);
					baseval += 86400000;
					i++;
				}
				return series;
			}
	
			 var options = {
			  series: [
			  {
				name: 'Order',
				data: generateDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 20, {
				  min: 10,
				  max: 5287
				})
			  },
			  {
				name: 'Profit',
				data: generateDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 20, {
				  min: 10,
				  max: 5658
				})
			  },
			  {
				name: 'Last Month',
				data: generateDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 20, {
				  min: 10,
				  max: 8554
				})
			  }
			],
			chart: {
			  type: 'area',
			  height: 320,
			  stacked: true,
			  events: {
				selection: function (chart, e) {
				  console.log(new Date(e.xaxis.min))
				}
			  },
			   toolbar: {
					show: false,
			   },
			},
			colors: ['var(--primary)', '#58bad7', '#ffd125'],
			dataLabels: {
			  enabled: false
			},
			stroke: {
			  curve: 'smooth'
			},
			fill: {
			  type: 'gradient',
			  gradient: {
				opacityFrom: 0.6,
				opacityTo: 0.2,
			  }
			},
			legend: {
			  position: 'top',
			  horizontalAlign: 'left'
			},
			xaxis: {
			  type: 'datetime'
			},
			};
	
			if(document.querySelector("#Statistics") !== null) {
				var chartBar1 = new ApexCharts(document.querySelector("#Statistics"), options);
				chartBar1.render();
			}
		}





		/* Function ============ */
		return {
			init: function () {
			},


			load: function () {
				columnChart();
				AllProject();
				Schedules();
				NewExperience();
				totalInvoices();
				pieChart();
				VisitorsChart();
				sessionsChart();
				LiveChart();
				chartBarRunning();
				Statistics();
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