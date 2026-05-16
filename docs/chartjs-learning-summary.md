# Chart.js Learning Summary

## Overview
Chart.js is a popular JavaScript charting library that provides simple yet flexible ways to create responsive charts for web applications. The Aplikasi Ujian Sekolah Kedinasan uses Chart.js v4 for the analytics dashboard.

## Installation

### CDN
```html
<script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
```

### NPM
```bash
npm install chart.js
```

## Basic Chart Setup

### HTML Canvas
```html
<canvas id="myChart"></canvas>
```

### JavaScript
```javascript
const ctx = document.getElementById('myChart');
const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
            label: 'Sales',
            data: [10, 20, 30, 40, 50],
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
```

## Chart Types

### 1. Bar Chart
```javascript
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['A', 'B', 'C', 'D'],
        datasets: [{
            label: 'Dataset 1',
            data: [10, 20, 30, 40],
            backgroundColor: ['red', 'blue', 'green', 'yellow']
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
```

### 2. Line Chart
```javascript
new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [{
            label: 'Sales',
            data: [10, 20, 30, 40, 50],
            borderColor: 'rgb(59, 130, 246)',
            tension: 0.1, // Curve smoothing
            fill: false
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});
```

### 3. Pie Chart
```javascript
new Chart(ctx, {
    type: 'pie',
    data: {
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [{
            data: [10, 20, 30],
            backgroundColor: ['red', 'blue', 'yellow']
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'top'
            }
        }
    }
});
```

### 4. Doughnut Chart
```javascript
new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: ['Red', 'Blue', 'Yellow'],
        datasets: [{
            data: [10, 20, 30],
            backgroundColor: ['red', 'blue', 'yellow'],
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        cutout: '60%' // Inner circle size
    }
});
```

### 5. Radar Chart
```javascript
new Chart(ctx, {
    type: 'radar',
    data: {
        labels: ['Speed', 'Reliability', 'Comfort', 'Safety', 'Efficiency'],
        datasets: [{
            label: 'Product A',
            data: [80, 90, 70, 85, 75],
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgba(59, 130, 246, 1)',
            pointBackgroundColor: 'rgba(59, 130, 246, 1)'
        }]
    },
    options: {
        scales: {
            r: {
                beginAtZero: true
            }
        }
    }
});
```

### 6. Polar Area Chart
```javascript
new Chart(ctx, {
    type: 'polarArea',
    data: {
        labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple'],
        datasets: [{
            data: [10, 20, 30, 40, 50],
            backgroundColor: [
                'rgba(255, 99, 132, 0.5)',
                'rgba(54, 162, 235, 0.5)',
                'rgba(255, 205, 86, 0.5)',
                'rgba(75, 192, 192, 0.5)',
                'rgba(153, 102, 255, 0.5)'
            ]
        }]
    }
});
```

### 7. Scatter Chart
```javascript
new Chart(ctx, {
    type: 'scatter',
    data: {
        datasets: [{
            label: 'Dataset 1',
            data: [
                { x: 10, y: 20 },
                { x: 15, y: 25 },
                { x: 20, y: 30 }
            ],
            backgroundColor: 'rgba(59, 130, 246, 0.5)'
        }]
    },
    options: {
        scales: {
            x: {
                type: 'linear',
                position: 'bottom'
            }
        }
    }
});
```

### 8. Bubble Chart
```javascript
new Chart(ctx, {
    type: 'bubble',
    data: {
        datasets: [{
            label: 'Dataset 1',
            data: [
                { x: 10, y: 20, r: 5 },
                { x: 15, y: 25, r: 10 },
                { x: 20, y: 30, r: 15 }
            ],
            backgroundColor: 'rgba(59, 130, 246, 0.5)'
        }]
    }
});
```

## Dataset Configuration

### Common Dataset Properties
```javascript
{
    label: 'Dataset Label',
    data: [10, 20, 30, 40, 50],
    
    // Colors
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    borderColor: 'rgba(59, 130, 246, 1)',
    borderWidth: 2,
    
    // Point styling (for line/scatter charts)
    pointBackgroundColor: 'rgb(59, 130, 246)',
    pointBorderColor: '#fff',
    pointHoverBackgroundColor: '#fff',
    pointHoverBorderColor: 'rgb(59, 130, 246)',
    pointRadius: 5,
    pointHoverRadius: 7,
    
    // Line styling (for line charts)
    tension: 0.1, // Curve smoothing
    fill: false,
    stepped: false, // Stepped line
    
    // Bar styling (for bar charts)
    borderRadius: 5,
    borderSkipped: false,
    
    // Hover effects
    hoverBackgroundColor: 'rgba(59, 130, 246, 0.8)',
    hoverBorderColor: 'rgba(59, 130, 246, 1)',
    
    // Hidden
    hidden: false
}
```

## Chart Options

### Responsive Options
```javascript
options: {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    resizeDelay: 0
}
```

### Scale Options
```javascript
options: {
    scales: {
        y: {
            beginAtZero: true,
            min: 0,
            max: 100,
            ticks: {
                stepSize: 10
            },
            grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.1)'
            },
            title: {
                display: true,
                text: 'Y Axis Title'
            }
        },
        x: {
            grid: {
                display: false
            },
            title: {
                display: true,
                text: 'X Axis Title'
            }
        }
    }
}
```

### Legend Options
```javascript
options: {
    plugins: {
        legend: {
            display: true,
            position: 'top', // 'top', 'bottom', 'left', 'right'
            align: 'start',
            labels: {
                color: '#333',
                font: {
                    size: 12
                },
                usePointStyle: true,
                padding: 20
            }
        }
    }
}
```

### Tooltip Options
```javascript
options: {
    plugins: {
        tooltip: {
            enabled: true,
            mode: 'index', // 'index', 'nearest', 'point', 'x', 'y'
            intersect: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#fff',
            borderWidth: 1,
            padding: 10,
            callbacks: {
                label: function(context) {
                    return `${context.dataset.label}: ${context.parsed.y}`;
                }
            }
        }
    }
}
```

### Title Options
```javascript
options: {
    plugins: {
        title: {
            display: true,
            text: 'Chart Title',
            color: '#333',
            font: {
                size: 16,
                weight: 'bold'
            },
            padding: {
                top: 10,
                bottom: 20
            }
        }
    }
}
```

## Advanced Features

### Multiple Datasets
```javascript
data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
        {
            label: 'Dataset 1',
            data: [10, 20, 30, 40, 50],
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgba(59, 130, 246, 1)'
        },
        {
            label: 'Dataset 2',
            data: [15, 25, 35, 45, 55],
            backgroundColor: 'rgba(239, 68, 68, 0.5)',
            borderColor: 'rgba(239, 68, 68, 1)'
        }
    ]
}
```

### Mixed Chart Types
```javascript
new Chart(ctx, {
    type: 'bar',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        datasets: [
            {
                type: 'bar',
                label: 'Bar Data',
                data: [10, 20, 30, 40, 50]
            },
            {
                type: 'line',
                label: 'Line Data',
                data: [15, 25, 35, 45, 55],
                borderColor: 'red',
                fill: false
            }
        ]
    }
});
```

### Stacked Charts
```javascript
scales: {
    x: {
        stacked: true
    },
    y: {
        stacked: true
    }
}
```

### Time Scale (requires date adapter)
```javascript
// Need to install date adapter and date-fns
// npm install chartjs-adapter-date-fns date-fns

import { Chart } from 'chart.js/auto';
import { register } from 'chart.js';
import { adapterDateFns } from 'chartjs-adapter-date-fns';

register(adapterDateFns);

new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['2024-01-01', '2024-02-01', '2024-03-01'],
        datasets: [{
            label: 'Sales',
            data: [10, 20, 30]
        }]
    },
    options: {
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'month'
                }
            }
        }
    }
});
```

### Animations
```javascript
options: {
    animation: {
        duration: 1000,
        easing: 'easeInOutQuart'
    },
    animation: {
        onComplete: function() {
            console.log('Animation complete');
        }
    }
}
```

## Chart Methods

### Update Chart
```javascript
// Update data
myChart.data.datasets[0].data = [20, 30, 40, 50, 60];
myChart.update();

// Update with animation
myChart.update('active');

// Update without animation
myChart.update('none');

// Update specific mode
myChart.update('default');
```

### Add Dataset
```javascript
const newDataset = {
    label: 'New Dataset',
    data: [15, 25, 35, 45, 55],
    backgroundColor: 'rgba(16, 185, 129, 0.5)',
    borderColor: 'rgba(16, 185, 129, 1)'
};
myChart.data.datasets.push(newDataset);
myChart.update();
```

### Remove Dataset
```javascript
myChart.data.datasets.splice(1, 1); // Remove second dataset
myChart.update();
```

### Destroy Chart
```javascript
myChart.destroy();
```

### Reset Chart
```javascript
myChart.reset();
myChart.update();
```

## Responsive Design

### Container with Fixed Aspect Ratio
```html
<div style="position: relative; height: 400px; width: 100%;">
    <canvas id="myChart"></canvas>
</div>
```

### Options for Responsive Behavior
```javascript
options: {
    responsive: true,
    maintainAspectRatio: false,
    onResize: function(chart, size) {
        console.log('Chart resized', size);
    }
}
```

## Chart.js in Aplikasi Ujian Sekolah Kedinasan

### Current Usage:
- Analytics dashboard with multiple chart types
- Exam performance trends
- User progress visualization
- Category-wise performance analysis
- Heatmap for question difficulty

### Implementation Examples:

```javascript
// Exam Performance Trend (Line Chart)
const performanceChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Average Score',
            data: [65, 70, 75, 72, 78, 80],
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true,
            tension: 0.4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 100
            }
        }
    }
});

// Category Performance (Bar Chart)
const categoryChart = new Chart(ctx2, {
    type: 'bar',
    data: {
        labels: ['TWK', 'TIU', 'TKP', 'TPA', 'PSIKOLOGIS'],
        datasets: [{
            label: 'Average Score',
            data: [75, 80, 70, 85, 72],
            backgroundColor: [
                'rgba(59, 130, 246, 0.5)',
                'rgba(239, 68, 68, 0.5)',
                'rgba(16, 185, 129, 0.5)',
                'rgba(245, 158, 11, 0.5)',
                'rgba(139, 92, 246, 0.5)'
            ]
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 100
            }
        }
    }
});

// Question Distribution (Pie Chart)
const distributionChart = new Chart(ctx3, {
    type: 'doughnut',
    data: {
        labels: ['Easy', 'Medium', 'Hard'],
        datasets: [{
            data: [30, 50, 20],
            backgroundColor: [
                'rgba(16, 185, 129, 0.5)',
                'rgba(245, 158, 11, 0.5)',
                'rgba(239, 68, 68, 0.5)'
            ]
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    }
});
```

## Best Practices

### 1. Performance
- Limit number of data points
- Use animation appropriately
- Destroy unused charts
- Use canvas size constraints

### 2. Accessibility
- Provide text alternatives
- Use meaningful colors
- Ensure sufficient contrast
- Add keyboard navigation support

### 3. Responsive Design
- Set maintainAspectRatio: false for flexible layouts
- Use container with fixed height
- Test on different screen sizes

### 4. Data Visualization
- Choose appropriate chart type
- Keep charts simple and clear
- Use consistent color schemes
- Add legends and labels

## Resources

**Official Documentation:**
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [Chart.js GitHub](https://github.com/chartjs/Chart.js)

**Learning Resources:**
- [Chart.js Tutorial](https://www.chartjs.org/docs/latest/getting-started/)
- [Chart.js Examples](https://www.chartjs.org/docs/latest/samples/)

**Tools:**
- [Chart.js Editor](https://www.chartjs.org/docs/latest/migration/usage.html)
- [Chart.js Plugin Registry](https://www.chartjs.org/docs/latest/developers/plugins/)
