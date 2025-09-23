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

    li.appendChild(span);
    actions.appendChild(toggleBtn)
    actions.appendChild(deleteBtn);
    li.appendChild(actions)
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