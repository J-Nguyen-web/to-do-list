const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const categoryTitle = document.getElementById('categoryTitle');
const categoryItems = document.querySelectorAll('.category-item');
const newCategoryBtn = document.getElementById('insertCategoryBtn');

let currentCategory = 'Daily';

function loadSavedCategories() {
    const savedCategories = JSON.parse(localStorage.getItem('categories')) || [];
    const categoryBar = document.querySelector('.sidebar ul');
    savedCategories.forEach( category => {
        const newCategoryItem = document.createElement('li');
        newCategoryItem.classList.add('category-item');
        newCategoryItem.dataset.category = category;
        newCategoryItem.textContent = category;

        newCategoryItem.addEventListener('click', () => {
            document.querySelectorAll('category-item').forEach(i => i.classList.remove('active'));
            newCategoryItem.classList.add('active');
            currentCategory = newCategoryItem.dataset.category;
            // in html li got  data-category attribute, when there is active it will take the value of  data-category
            categoryTitle.textContent = newCategoryItem.textContent;
            loadTasks(currentCategory);
            
            //themes
            document.body.classList.remove('daily-theme','shopping-theme', 'work-theme')
            document.body.classList.add('custom-theme')

            window.scrollTo ({ // after a click on category (bcoz item.addEventlistener got already on 'click')
            top: 0, // i will go to the very top of the page
            behavior: "smooth", // it will drag it slowly instead of like reload it immediatly
            });

            taskInput.focus(); // the class attribute taskInput will be focused        
        });
        categoryBar.appendChild(newCategoryItem);
    });
}

window.onload = () => {
    loadSavedCategories();
    loadTasks(currentCategory);
    document.body.classList.add(currentCategory.toLowerCase() + '-theme');
}

newCategoryBtn.addEventListener('click', () => {
    const newCategory = prompt('Enter a name for the new category:')
    if(!newCategory) return;
    
    const insertedCategory = newCategory.trim();
    if (insertedCategory === '') return;

    // check for duplicates
    const exists = Array.from(categoryItems).some(
        item => item.dataset.category.toLowerCase() === insertedCategory.toLowerCase()
    );
    if(exists) {
        alert('that category already exists!');
        return;
    }

    // create new category element
    const newCategoryItem = document.createElement('li');
    newCategoryItem.classList.add('category-item');
    newCategoryItem.dataset.category = insertedCategory;
    newCategoryItem.textContent = insertedCategory;

    // add click event for the new category element

    newCategoryItem.addEventListener('click', () => {
        document.querySelectorAll('category-item').forEach(i => i.classList.remove('active'));
        newCategoryItem.classList.add('active');
        currentCategory = newCategoryItem.dataset.category;
        categoryTitle.textContent = newCategoryItem.textContent;
        loadTasks(currentCategory);
        
        //themes
        document.body.classList.remove('daily-theme','shopping-theme', 'work-theme')
        document.body.classList.add('custom-theme')

        window.scrollTo ({ top: 0, behavior: "smooth", 
        });

        taskInput.focus();      
    });
    
    // Append to the sidebar with other categories
    document.querySelector('.sidebar ul').appendChild(newCategoryItem);

    // Save custom category to the list with all categories in LocalStorage
    const savedCategories = JSON.parse(localStorage.getItem('categories')) || [];
    savedCategories.push(insertedCategory);
    localStorage.setItem('categories', JSON.stringify(savedCategories));

    // initialize empty task array from this category
    const allTasks = JSON.parse(localStorage.getItem('tasks')) || {};
    allTasks[insertedCategory] = [];
    localStorage.setItem('tasks', JSON.stringify(allTasks));

    alert(`Category "${insertedCategory}" saved succesfully!`)
});



categoryItems.forEach(item => {
    item.addEventListener('click', () => {
        categoryItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentCategory = item.dataset.category;
        categoryTitle.textContent = item.textContent;
        loadTasks(currentCategory);
        
        //themes
        document.body.classList.remove('daily-theme','shopping-theme', 'work-theme')
        document.body.classList.add(currentCategory.toLowerCase() + '-theme')

        window.scrollTo ({
            top: 0,
            behavior: "smooth",
        });

        taskInput.focus();
    })
});

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