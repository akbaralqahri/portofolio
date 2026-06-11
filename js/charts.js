// ===============================================
// SKILLS RADAR CHART (CHART.JS)
// ===============================================

class SkillsChart {
    constructor() {
        this.ctx = document.getElementById('skillsRadarChart');
        if (!this.ctx) return;
        this.chart = null;
        this.init();
    }

    init() {
        // Wait for chart.js to be available
        if (typeof Chart === 'undefined') {
            setTimeout(() => this.init(), 100);
            return;
        }

        // Setup Intersection Observer to animate only when scrolled into view
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                this.renderChart();
                observer.disconnect();
            }
        }, { threshold: 0.2 });
        
        observer.observe(this.ctx);
    }

    renderChart() {
        Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
        Chart.defaults.font.family = "'Fira Code', monospace";

        this.chart = new Chart(this.ctx, {
            type: 'radar',
            data: {
                labels: ['Python', 'SQL', 'Machine Learning', 'Data Visualization', 'Statistics', 'Cloud / Tools'],
                datasets: [{
                    label: 'Skill Proficiency',
                    data: [5, 4, 3, 5, 3, 3],
                    backgroundColor: 'rgba(212, 175, 55, 0.2)',
                    borderColor: '#D4AF37',
                    pointBackgroundColor: '#D4AF37',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#D4AF37',
                    borderWidth: 2,
                    pointRadius: 4,
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            font: {
                                size: window.innerWidth < 768 ? 10 : 12
                            },
                            color: '#F5F5F5' // Changed to Off White
                        },
                        ticks: {
                            display: false,
                            min: 0,
                            max: 5,
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(13, 13, 13, 0.9)', // Jet black
                        titleColor: '#D4AF37',
                        bodyColor: '#F5F5F5',
                        borderColor: 'rgba(212, 175, 55, 0.3)',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return 'Level ' + context.raw + ' / 5';
                            }
                        }
                    }
                }
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SkillsChart();
});
