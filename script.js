const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const categoryTitle = document.getElementById('categoryTitle');
const categoryItems = document.querySelectorAll('.category-item');
const newCategoryBtn = document.getElementById('insertCategoryBtn');

let currentCategory = 'Daily';
let draggedItem = null;

// === ERROR UI === //
function showError (message) {
    let box = document.getElementById('errorBox');

    if(!box) {
        box = document.createElement('div');
        box.id = 'errorBox';
        box.style.position = 'fixed';
        box.style.top = '0';
        box.style.left = '0';
        box.style.width = '100%';
        box.style.background = '#b70303';
        box.style.color = 'white';
        box.style.padding = '8px';
        box.style.zIndex = '9999';
        box.style.fontSize = '14px';
        document.body.appendChild(box);
    }

    box.textContent = message;

    clearTimeout(box.hideTimeout);

    box.hideTimeout = setTimeout(() => {
        box.remove
    }, 3000);
}

//=== STORAGE ===//

const STORAGE_KEYS = {
    TASKS: 'tasks',
    CATEGORIES: 'categories'
};

function safeRead(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if(!raw) return fallback;

        const parsed = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null) return fallback;

        return parsed;
    } catch {
        return fallback;
    }
}

function safeWrite(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn('Safe failed:', error)
    }
}

//=== INIT ===//
window.onload = () => {
    loadSavedCategories();
    loadTasks(currentCategory);
    document.body.classList.add(currentCategory.toLowerCase() + '-theme');
}

let isDragging = false;
let holdTimeout;

// function that chech the type of the device
function isMobile(){
    return window.matchMedia('(pointer: coarse)').matches;
}

// === CATEGORY SWITCH === //
categoryItems.forEach(item => {
    item.addEventListener('click', () => {
        categoryItems.forEach(i => i.classList.remove('active'));
        document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        currentCategory = item.dataset.category;
        categoryTitle.textContent = item.textContent;

        loadTasks(currentCategory);
        
        //themes
        document.body.className = '';
        // document.body.classList.remove('daily-theme','shopping-theme', 'work-theme', 'custom-theme')
        document.body.classList.add(currentCategory.toLowerCase() + '-theme')

        // window.scrollTo ({
        //     top: 0,
        //     behavior: "smooth",
        // });

        // if(!isMobile()){
        //     taskInput.focus();
        // }
        
    })
});

// === SAVE - LOAD === //
function saveTask() {
    const tasks = safeRead(STORAGE_KEYS.TASKS, {}) ;

    const currentTasks = [];

    taskList.querySelectorAll('li').forEach( li => {
        currentTasks.push({
            text: li.querySelector('.task-text').textContent,
            done: li.classList.contains('done')
        });
    });

    tasks[currentCategory] = currentTasks;

    safeWrite(STORAGE_KEYS.TASKS, tasks)
}

function loadTasks(category) {
    taskList.innerHTML = '';
    let tasks = safeRead(STORAGE_KEYS.TASKS, {});
    const list = Array.isArray(tasks[category]) ? tasks[category] : [];
    
    list.forEach(task => renderTasks(task.text, task.done));
}
// === TASK CREATE === //
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

taskInput.addEventListener('keypress',function(event){
    if(event.key === 'Enter'){
        newTask();
    }
});

// === RENDER TASK === //
function renderTasks(text, done) {
    const li = document.createElement('li');

    // drag handle
    const dragHandle = document.createElement('span');
    dragHandle.classList.add('drag-handle');
    dragHandle.textContent = '⥮';

    // task text
    const textSpan = document.createElement('span');
    textSpan.classList.add('task-text');
    textSpan.textContent = text;

    // action container
    const actions = document.createElement('div')
    actions.classList.add('actions')

    // toggle button
    const toggleBtn = document.createElement('button');
    toggleBtn.classList.add('toggle');
    toggleBtn.textContent = done ? 'Undone' : 'Done';

    // delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('delete');
    deleteBtn.textContent = 'X';

    // done state
    if(done) li.classList.add('done');

    // toggle logic
    toggleBtn.onclick = () => {
        li.classList.toggle('done');
        toggleBtn.textContent = li.classList.contains('done')
            ? 'Undone'
            : 'Done';        
        saveTask();
    };

    // delete logic
    deleteBtn.onclick = () => {
        if(confirm(`Delete task?`)) {
            li.remove();
            saveTask(); }
    }


    // build structure
    actions.appendChild(toggleBtn)
    actions.appendChild(deleteBtn);

    li.appendChild(dragHandle);
    li.appendChild(textSpan);
    li.appendChild(actions);

    li.style.transition = 'all 0.3s ease'

    taskList.appendChild(li);

    enableDragDrop(li) // enables dragging
}

// === DRAG & TOUCH === //
function enableDragDrop(li) {

    const handle = li.querySelector('.drag-handle');

    handle.setAttribute('draggable', true);

    handle.addEventListener('dragstart', () => {
        draggedItem = li;
        li.classList.add('dragging');
    });

    li.addEventListener('dragend', () => {
        li.classList.remove('dragging');
        draggedItem = null;
        saveTask();
    });

    // === TOUCH (mobile) === //

    let holdTimeout;
    let isDragging = false;

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
        const targetLi = elementBelow?.closest('li');
        
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

        li.classList.remove('dragging');

        draggedItem = null;
        isDragging = false;
    })

}

function autoScroll(pointerY){
    const threshold = 80;
    const speed = 8;

    const viewportHeight = window.innerHeight;

    if(pointerY < threshold) {
        window.scrollBy({
            top: -speed, 
            behavior: 'auto'
        });
    } else if (pointerY > viewportHeight - threshold){
        window.scrollBy({
top: speed,
                        behavior: 'auto'
        });
    }
}

// === Helper for mouse drag === //
taskList.addEventListener('dragover', (event) => {
    event.preventDefault();

    const afterElement = getDragAfterElement(taskList, event.clientY);
    
    if (!afterElement) {
        taskList.appendChild(draggedItem);
    } else {
        taskList.insertBefore(draggedItem, afterElement);
    }
})

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

        // if(!isMobile()){
        //     taskInput.focus();
        // } // the class attribute taskInput will be focused
    });
    return customCategory;
}

// === CATEGORIES === //
function loadSavedCategories() {
    let savedCategories = safeRead(STORAGE_KEYS.CATEGORIES, []) ;
    const categoryBar = document.querySelector('.sidebar ul');

    // remove old custom categories
    categoryBar.querySelectorAll('.custom-category').forEach(el => el.remove())
    
    savedCategories.forEach( category => {
        const customCategory = createCategoryElement(category, true);
        customCategory.classList.add('custom-category');
        categoryBar.appendChild(customCategory);
    });
}
newCategoryBtn.addEventListener('click', () => {
    const newCategory = prompt('Enter a name for the new category:')?.trim();
    if(!newCategory) {
        alert('Category name cannot be empty');
        return
    };
    
    const insertedCategory = safeRead(STORAGE_KEYS.CATEGORIES, []);

    // check for duplicates
    const exists = Array.from(document.querySelectorAll('.category-item')).some(
        item => item.dataset.category.toLowerCase() === newCategory.toLowerCase()
    );

    if(exists) {
        alert('That category already exists!');
        return;
    }

    insertedCategory.push(newCategory);
    safeWrite(STORAGE_KEYS.CATEGORIES, insertedCategory);

    const tasks = safeRead(STORAGE_KEYS.TASKS, {});
    tasks[newCategory] = []
    safeWrite(STORAGE_KEYS.TASKS, tasks);

    loadSavedCategories();

    // // Save custom category to the list with all categories in LocalStorage
    // const savedCategories = JSON.parse(localStorage.getItem('categories')) || [];
    // savedCategories.push(insertedCategory);
    // localStorage.setItem('categories', JSON.stringify(savedCategories));
    // // loadSavedCategories();
    // const categoryBar = document.querySelector('.sidebar ul');
    // const newCategoryElement = createCategoryElement(insertedCategory, true)
    // categoryBar.appendChild(newCategoryElement);

    // // initialize empty task array from this category
    // const allTasks = JSON.parse(localStorage.getItem('tasks')) || {};
    // allTasks[insertedCategory] = [];
    // localStorage.setItem('tasks', JSON.stringify(allTasks));
});

// = REMOVE CUSTOM CATEGORY =
function removeCategory(categoryName, categoryItem){
    categoryItem.remove();

    // remove from localStorage categories list
    let savedCategories = JSON.parse(localStorage.getItem('categories')) || [];
    savedCategories = savedCategories.filter(category => category !== categoryName);
    localStorage.setItem('categories', JSON.stringify(savedCategories));

    // remove its task
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
