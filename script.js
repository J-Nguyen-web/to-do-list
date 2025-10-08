const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const categoryTitle = document.getElementById('categoryTitle');
const categoryItems = document.querySelectorAll('.category-item');

let currentCategory = 'Daily';

window.onload = () => {
    loadTasks(currentCategory);
    document.body.classList.add(currentCategory.toLowerCase() + '-theme');
}

categoryItems.forEach(item => {
    item.addEventListener('click', () => {
        categoryItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentCategory = item.dataset.category;
        // in html li got  data-category attribute, when there is active it will take the value of  data-category
        categoryTitle.textContent = item.textContent;
        loadTasks(currentCategory);

        window.scrollTo ({ // after a click on category (bcoz item.addEventlistener got already on 'click')
            top: 0, // i will go to the very top of the page
            behavior: "smooth", // it will drag it slowly instead of like reload it immediatly

        });
        taskInput.focus(); // the class attribute taskInput will be focused
        document.body.classList.remove('daily-theme','shopping-theme', 'work-theme')
        document.body.classList.add(currentCategory.toLowerCase() + '-theme')
    })
})
function newTask(){
    const taskText = taskInput.value.trim();
    if(taskText === '') {
        alert('Please enter a task!')
        return;
    }
    renderTasks(taskText, false);
    saveTask();
    taskInput.value = '';
}

function renderTasks(text, done) {
    const li = document.createElement('li');
    const actions = document.createElement('div')
    actions.classList.add('actions')

    const span = document.createElement('span');
    const toggleBtn = document.createElement('button');
    toggleBtn.classList.add('toggle')
    toggleBtn.textContent = 'Done'
    
    span.textContent = text;

    if(done) {        
        li.classList.add('done');
        toggleBtn.textContent = 'Undone'
    }

    li.onclick = () => {
        li.classList.toggle('done');
        if(li.classList.contains('done')){
            toggleBtn.textContent = 'Undone'
        }else{
            toggleBtn.textContent = 'Done'
        }
        
        saveTask();
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'X';
    deleteBtn.onclick = () => {
        li.remove();
        saveTask();
    }

    
    actions.appendChild(toggleBtn)
    actions.appendChild(deleteBtn);
    li.appendChild(span);
    li.appendChild(actions)
    taskList.appendChild(li);
}

function saveTask() {
    const tasks = JSON.parse(localStorage.getItem('tasks') || '{}') ;
    const currentTasks = [];

    taskList.querySelectorAll('li').forEach( li => {
        currentTasks.push({
        text: li.querySelector('span').textContent,
        done: li.classList.contains('done')
        });
    });

    tasks[currentCategory] = currentTasks;
    try {
        localStorage.setItem('tasks',JSON.stringify(tasks))
    } catch (error) {
        console.warn('LocalStorage save failed:', error)
    }
    
}

function loadTasks(category) {
    taskList.innerHTML = '';
    let tasks = {};
    try {
        tasks = JSON.parse(localStorage.getItem('tasks')) || {};
    } catch (error) {
        tasks = {};
    }
    
    const categoryTasks = Array.isArray (tasks[category]) ? tasks[category] : [];
    categoryTasks.forEach(task => renderTasks(task.text, task.done))
}

taskInput.addEventListener('keypress',function(event){
    if(event.key === 'Enter'){
        newTask();
    }
});