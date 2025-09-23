const taskInput = document.getElementById('taskInput')
const taskList = document.getElementById('taskList')

window.onload = () => {
    const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    savedTasks.forEach(task => renderTasks(task.text, task.done))
}

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

    const span = document.createElement('span');
    span.textContent = text;
    if(done) {
        li.classList.add('done')
    }

    span.onclick = () => {
        li.classList.toggle
        saveTask();
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'X';
    deleteBtn.onclick = () => {
        li.remove();
        saveTask();
    }
    
    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);
}

function saveTask() {
    const tasks = [];
    taskList.querySelectorAll('li').forEach( li => {
        tasks.push({
        text: li.querySelector('span').textContent,
        done: li.classList.contains('done')
        });
    });
    localStorage.setItem('tasks',JSON.stringify(tasks))
}

taskInput.addEventListener('keypress',function(event){
    if(event.key === 'Enter'){
        newTask();
    }
});