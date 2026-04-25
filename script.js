const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const categoryTitle = document.getElementById('categoryTitle');
const categoryItems = document.querySelectorAll('.category-item');
const newCategoryBtn = document.getElementById('insertCategoryBtn');

let currentCategory = 'Daily';

window.onload = () => {
    const data = {
        localStorage: localStorage,
        origin: location.origin,
        href: location.href,
        storageKeys: Object.keys(localStorage),
        tasks: localStorage.getItem('tasks'),
        categories: localStorage.getItem('categories'),
    }
    loadSavedCategories();
    loadTasks(currentCategory);
    document.body.classList.add(currentCategory.toLowerCase() + '-theme');
    console.log('TASKS-',localStorage.getItem('tasks'))
    console.log('CATEGORIES-',localStorage.getItem('categories'));
    document.body.insertAdjacentHTML(
        'afterbegin',
        `<pre style="position:fixed;top:0;left:0;z-index:9999;background:black;color:white;padding:8px;max-height:40vh;overflow:auto;">${JSON.stringify(data,null,2)}</pre>`
    );
    // localStorage.removeItem('categories')
    // localStorage.removeItem('tasks')
    // console.log(localStorage)
}

let draggedItem = null;
let isDragging = false;
let holdTimeout;
    
taskList.addEventListener('dragover', (event) => {
    event.preventDefault();

    const afterElement = getDragAfterElement(taskList, event.clientY);
    
    if (afterElement == null) {
        taskList.appendChild(draggedItem);
    } else {
        taskList.insertBefore(draggedItem, afterElement);
    }
})

// function that chech the type of the device
function isMobile(){
    return window.matchMedia('(pointer: coarse)').matches;
}

categoryItems.forEach(item => {
    item.addEventListener('click', () => {
        categoryItems.forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentCategory = item.dataset.category;
        categoryTitle.textContent = item.textContent;
        loadTasks(currentCategory);
        
        //themes
        document.body.classList.remove('daily-theme','shopping-theme', 'work-theme', 'custom-theme')
        document.body.classList.add(currentCategory.toLowerCase() + '-theme')

        window.scrollTo ({
            top: 0,
            behavior: "smooth",
        });

        // if(!isMobile){
        //     taskInput.focus();
        // }
        
    })
});

// = CREATE CATEGORY =
function createCategoryElement (categoryName, isCustom = false) {
    // create new category element
    const customCategory = document.createElement('li');
    customCategory.classList.add('category-item');
    customCategory.dataset.category = categoryName;
    // in html li got data-category attribute, when there is active it will take the value of data-category
    customCategory.textContent = categoryName;

// add delete button for custom categories
    if(isCustom) {
        const delBtn = document.createElement('button');
        delBtn.textContent = 'X';
        delBtn.classList.add('delete-category');
        delBtn.title = 'Delete this category';
        delBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            // preventing click on category
            const confirmDel = confirm(`Delete category "${categoryName}" and all its tasks?`)
            if(confirmDel) removeCategory(categoryName, customCategory)
        });
        customCategory.appendChild(delBtn)
    }

    // add click event for the new category element
    customCategory.addEventListener('click', () => {
        document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
        customCategory.classList.add('active');
        currentCategory = categoryName;
        categoryTitle.textContent = categoryName;
        loadTasks(currentCategory);
    
        // change themes based on category
        document.body.classList.remove('daily-theme','shopping-theme', 'work-theme', 'custom-theme')
        if (['Daily', 'Shopping', 'Work'].includes(categoryName)) {
            document.body.classList.add(categoryName.toLowerCase() + '-theme')
        } else {
            document.body.classList.add('custom-theme')
        }    

        // auto scroll up & focus
        window.scrollTo ({ // after a click on category (bcoz item.addEventlistener got already on 'click')
            top: 0, // i will go to the very top of the page
            behavior: "smooth", // it will drag it slowly instead of like reload it immediatly
            });

        // if(!isMobile){
        //     taskInput.focus();
        // } // the class attribute taskInput will be focused
    });
    return customCategory;
}

function loadSavedCategories() {
    let savedCategories = JSON.parse(localStorage.getItem('categories')) || [];
    const categoryBar = document.querySelector('.sidebar ul');
    
    savedCategories.forEach( category => {
        const customCategory = createCategoryElement(category, true);
        categoryBar.appendChild(customCategory);
    });
}
newCategoryBtn.addEventListener('click', () => {
    const newCategory = prompt('Enter a name for the new category:');
    if(!newCategory) return;
    
    const insertedCategory = newCategory.trim();
    if (insertedCategory === '') return alert('Category name cannot be empty');

    // check for duplicates
    const exists = Array.from(document.querySelectorAll('.category-item')).some(
        item => item.dataset.category.toLowerCase() === insertedCategory.toLowerCase()
    );

    if(exists) {
        alert('that category already exists!');
        return;
    }

    // Save custom category to the list with all categories in LocalStorage
    const savedCategories = JSON.parse(localStorage.getItem('categories')) || [];
    savedCategories.push(insertedCategory);
    localStorage.setItem('categories', JSON.stringify(savedCategories));
    // loadSavedCategories();
    const categoryBar = document.querySelector('.sidebar ul');
    const newCategoryElement = createCategoryElement(insertedCategory, true)
    categoryBar.appendChild(newCategoryElement);

    // initialize empty task array from this category
    const allTasks = JSON.parse(localStorage.getItem('tasks')) || {};
    allTasks[insertedCategory] = [];
    localStorage.setItem('tasks', JSON.stringify(allTasks));
});

// = REMOVE CUSTOM CATEGORY =
function removeCategory(categoryName, categoryItem){
    categoryItem.remove();

    // remove from localStorage categories list
    let savedCategories = JSON.parse(localStorage.getItem('categories')) || [];
    savedCategories = savedCategories.filter(category => category !== categoryName);
    localStorage.setItem('categories', JSON.stringify(savedCategories));

    // remove its taska
    const tasks = JSON.parse(localStorage.getItem('tasks')) || {}
    delete tasks[categoryName];
    localStorage.setItem('tasks', JSON.stringify(tasks));

    // set category to Daily
    if(currentCategory === categoryName) {
        const dailyCategory = document.querySelector('.sidebar ul li');
        currentCategory = 'Daily';
        categoryTitle.textContent = dailyCategory.textContent;
        loadTasks('Daily');
        document.body.classList.remove('daily-theme','shopping-theme', 'work-theme', 'custom-theme');
        document.body.classList.add('daily-theme');
        dailyCategory.classList.add('active');

    }
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

    toggleBtn.onclick = () => {
        li.classList.toggle('done');

        toggleBtn.textContent = li.classList.contains('done')
            ? 'Undone'
            : 'Done';        
        
        saveTask();
    }

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'X';
    deleteBtn.onclick = () => {
        const confrimDelTask = confirm(`Delete task?`)
        if(confrimDelTask) {
            li.remove();
        saveTask();
        }
    }

    actions.appendChild(toggleBtn)
    actions.appendChild(deleteBtn);
    li.appendChild(span);
    li.appendChild(actions)
    taskList.appendChild(li);

    enableDragDrop(li) // enables dragging
}

function saveTask() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || {} ;
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

//прикрепяне на ивента към всеки task
function enableDragDrop(li) {

    // === TOUCH (mobile) === //
    li.addEventListener('touchstart', () => {
        holdTimeout = setTimeout(() => {
            isDragging = true;
            draggedItem = li;
            li.classList.add('dragging');

            // само определени devices поддържат тази вибрация
            if (navigator.vibrate) navigator.vibrate(8)

        }, 300) // hold time
    });

    li.addEventListener('touchmove', (event) => {

        if( !isDragging) return;

        event.preventDefault();

        const touch = event.touches[0];
        const elementBelow = document.elementFromPoint(touch.clientX, touch.clientY);
        
        if(!elementBelow) return;

        const targetLi = elementBelow.closest('li');
        if(targetLi && targetLi !== draggedItem) {
            const rect = targetLi.getBoundingClientRect();
            const isBelow = touch.clientY > rect.top + rect.height / 2;

            taskList.insertBefore(draggedItem, isBelow ? targetLi.nextSibling : targetLi);
        }

        autoScroll(touch.clientY)
    });

    li.addEventListener('touchend', () => {
        clearTimeout(holdTimeout);

        if(isDragging) {
            li.classList.remove('dragging');
            draggedItem = null;
            saveTask();
        }

        isDragging = false;
    });

    li.addEventListener('touchcancel', () => {
        clearTimeout(holdTimeout);
        isDragging = false;
    })

    // === MOUSE (Decstop) === //
    li.setAttribute('draggable', true);

    li.addEventListener('dragstart', () => {
        draggedItem = li;
        li.classList.add('dragging');
    });

    li.addEventListener('dragend', () => {
        li.classList.remove('dragging');
        draggedItem = null;
        saveTask();
    });

}

// === Helper for mouse drag === //
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('li:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if(offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
        }, { offset: Number.NEGATIVE_INFINITY}).element
}