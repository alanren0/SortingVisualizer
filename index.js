
let speed = document.getElementById('speedSlider').value;
document.getElementById('speedDisplay').innerHTML = `${speed}ms`
let nums = [20, 6, 1, 18, 17, 8, 7, 28, 3, 19, 4, 9, 16, 29, 27, 26, 25, 24, 5, 23, 15, 10, 14, 21, 2, 22, 13, 30, 11, 12];
let origNums = [...nums];
let defaultColors = Array(nums.length).fill('steelblue');
let running = false;
let reset = false;

const chart = createChart(nums);

handleFormSubmit();
handleSlider();
handleReset();
handleSort();

////////////////////
// Event Handlers //
////////////////////

function handleSort() {
    document.getElementById('sort').onclick = async () => {
        const algo = document.getElementById('algorithms').value;
        let iter;
        switch (algo) {
            case 'selectionSort':
                iter = selectionSort(nums);
                break;
            case 'bubbleSort':
                iter = bubbleSort(nums);
                break;
            case 'insertionSort':
                iter = insertionSort(nums);
                break;
            case 'mergeSort':
                iter = mergeSort(nums, 0, nums.length -1);
                break;
            case 'quickSort':
                iter = quickSort(nums, 0, nums.length -1);
                break;
            default:
                iter = quickSort(nums, 0, nums.length -1);
        }

        await runSort(iter)
    }
}

function handleSlider() {
    const slider = document.getElementById('speedSlider')
    slider.onchange = () => {
        speed = parseInt(slider.value);
        document.getElementById('speedDisplay').innerHTML = `${speed}ms`;
        updateChart(null, null, speed)
    }
}

function handleReset() {
    document.getElementById('reset').onclick = () => {
        if (running) reset = true;
        nums = [...origNums]
        updateChart(nums, defaultColors)
    }
}

function handleFormSubmit() {
    document.getElementById('form').onsubmit = (e) => {
        e.preventDefault();
        const input = document.getElementById('nums').value
        nums = parseInput(input);
        origNums = [...nums];
        defaultColors = Array(nums.length).fill('steelblue');
        updateChart(nums, defaultColors)
    }
}

////////////
// Others //
////////////

function disableButtons() {
    document.getElementById('sort').disabled = true;
    document.getElementById('submit').disabled = true;
}

function enableButtons() {
    document.getElementById('sort').disabled = false;
    document.getElementById('submit').disabled = false;
}

function parseInput (input) {
    const nums = input.split(',');

    const res = nums.map(num => parseInt(num));

    return res;
}


function setColorsByIndex(colorArr, indices, color) {
    indices.forEach(i => {
        colorArr[i] = color
    })
    return colorArr;
}


function timer(ms) {
    return new Promise(res => setTimeout(res, ms));
} 

async function runSort(iter) {

    disableButtons();
    running = true;

    for (const item of iter) {
        if (item.colors != null) {
            updateChart(item.nums, item.colors);
        } else {
            newColors = [...defaultColors];
            for (let i=0; i<item.indices.length; i++) {
                newColors[item.indices[i]] = item.color;
            }
            updateChart(item.nums, newColors);
        }
        if (reset) {
            nums = [...origNums]
            break; 
        }
        await timer(speed);
    }

    updateChart(nums, defaultColors) // reset colors
    enableButtons();
    running = false;
    reset = false;
}

/////////////
// Chartjs //
/////////////

function updateChart (newNums, colors, animationSpeed) {

    chart.data.datasets.forEach((dataset) => {
        if (newNums) {
            dataset.data = newNums;
            const labels = [...newNums.map((n, i) => i)];
            chart.data.labels = labels;
        }
        if (colors) 
            dataset.backgroundColor = colors;
    });
    if (animationSpeed)
        chart.options.animation.duration = animationSpeed;
    chart.update();
}

function createChart (nums) {
    const ctx = document.getElementById('chart');

    const labels = [...nums.map((n, i) => i)];

    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: nums,
                borderWidth: 1,
                backgroundColor: defaultColors
            }]
        },
        options: {
            scales: {
                y: {
                    beginsAtZero: true
                }
            },
            animation: {
                duration: speed,
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    })

    return chart;
}

////////////////////////
// Sorting Algorithms //
////////////////////////

function swap(arr, i1, i2) {
    const tmp = arr[i1];
    arr[i1] = arr[i2];
    arr[i2] = tmp;
}

function* selectionSort (nums) {
    for (let i=0; i < nums.length; i++) {
        let minIndex = i;
        for (let j=i; j < nums.length; j++) {
            if (nums[j] < nums[minIndex]) {
                minIndex = j;
            }
            yield { nums: nums, indices: [j], color: 'red' }
        }
        swap(nums, i, minIndex);
        yield { nums: nums, indices: [i, minIndex], color: 'green' }
    }
}

function* bubbleSort (nums) {
    for (let i = 0; i < nums.length - 1; i++) {
        for (let j = 0; j < nums.length - i - 1; j++) {
            yield { nums: nums, indices: [j], color: 'red' }
            if (nums[j] > nums[j + 1]) {
                swap(nums, j, j + 1)
                yield { nums: nums, indices: [j, j + 1], color: 'green' }
            }
        }
    }
}

function* insertionSort(nums) {
    
    for (let i = 1; i < nums.length; i++) {
        yield { nums: nums, indices: [i], color: 'red' }
        let key = nums[i]
        let j = i
        while (j > 0 && nums[j - 1] > key) {
            nums[j] = nums[j - 1]
            yield { nums: nums, indices: [j - 1], color: 'green' }
            j--;
        }
        nums[j] = key;

    }
}

function* merge(arr, l, m, r) {
    let n1 = m - l + 1;
    let n2 = r - m;
 
    // make two subarrays
    let L = new Array(n1); 
    let R = new Array(n2);
 
    for (let i = 0; i < n1; i++)
        L[i] = arr[l + i];
    for (let j = 0; j < n2; j++)
        R[j] = arr[m + 1 + j];

    // set coloring scheme
    const colorScheme = [...defaultColors];
    for (let i = l; i <= r; i++) {
        colorScheme[i] = '#ace7fa'
    }
    let colors = [...colorScheme];

    yield { nums: arr, colors: colors }
    let i = 0;
    let j = 0;
    let k = l;
 
    // sort subarrays into main array
    while (i < n1 && j < n2) {
        if (L[i] <= R[j]) {
            colors = [...colorScheme]
            yield { nums: arr, colors: setColorsByIndex(colors, [l + i, k], 'green') }
            arr[k] = L[i];
            i++;
        } else {
            colors = [...colorScheme]
            yield { nums: arr, colors: setColorsByIndex(colors, [m + j, k], 'green') }
            arr[k] = R[j];
            j++;
        }
        k++;
    }
 
    // fill any remaining from first array to main array
    while (i < n1) {
        colors = [...colorScheme]
        yield { nums: arr, colors: setColorsByIndex(colors, [l + i, k], 'green') }
        arr[k] = L[i];
        i++;
        k++;
    }
 
    // fill any remaining from second array to main array
    while (j < n2) {
        colors = [...colorScheme]
        yield { nums: arr, colors: setColorsByIndex(colors, [m + j, k], 'green') }
        arr[k] = R[j];
        j++;
        k++;
    }
}

function* mergeSort(arr,l, r){
    if (l >= r) {
        return;
    }

    let m = l + parseInt((r-l)/2);
    yield* mergeSort(arr,l,m);
    yield* mergeSort(arr,m+1,r);
    yield* merge(arr,l,m,r);
}

function* quickSort(arr, low, high) {
    if (low >= high) return;

    // set coloring scheme
    let colorScheme = [...defaultColors];
    for (let i = low; i < high; i++) {
        colorScheme[i] = '#ace7fa';
    }
    setColorsByIndex(colorScheme, [high], 'black');
    let colors = [...colorScheme];

    yield { nums: arr, colors: setColorsByIndex(colors, [high], 'black') }
    let pivot = arr[high]; // choose pivot
    let i = low;

    for (let j = low; j <= high - 1; j++) {
        
        colors = [...colorScheme];
        yield { nums: arr, colors: setColorsByIndex(colors, [i, j], 'red') }

        // element smaller than pivot -> swap left and right pointers
        if (arr[j] < pivot) {
            colors = [...colorScheme];
            yield { nums: arr, colors: setColorsByIndex(colors, [i, j], 'green') } 
            
            swap(arr, i, j);
            i++;
        }
    }
    
    colors = [...colorScheme];
    yield { nums: arr, colors: setColorsByIndex(colors, [i, high], 'green') }
    swap(arr, i, high) // move pivot to correct position

    let pi = i; // pivot location
    colors = [...colorScheme];

    yield* quickSort(arr, low, pi - 1);
    yield* quickSort(arr, pi + 1, high);

}
