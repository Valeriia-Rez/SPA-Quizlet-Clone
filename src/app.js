let zero = 0;
let minusOne = -1;
let fiveHun = 500;

class Route {
    constructor(name, path, view) {
        this.name = name;
        this.path = path;
        this.view = view;
    }

    setProps(newProps) {
        this.props = newProps;
    }
    renderView() {
        return this.view(this.props);
    }
}


class Router {
    constructor(routes = [], renderNode) {
        this.routes = routes;
        this.renderNode = renderNode;
        this.navigate(location.pathname + location.hash);
    }

    addRoutes(routes) {
        this.routes = [...this.routes, ...routes];
    }

    match(route, requestPath) {
        let paramNames = [];
        let regexPath = route.path.replace(/([:*])(\w+)/g, (full, colon, name) => {
            paramNames.push(name);
            return '([^/]+)';
        }) + '(?:/|$)'
        let params = {};
        let routeMatch = requestPath.match(new RegExp(regexPath));
        if (routeMatch !== null) {
            params = routeMatch.slice(1).reduce((params, value, index) => {
                if (params === null) {
                    params = {};
                }
                params[paramNames[index]] = value;
                return params;
            }, null);
        }
        route.setProps(params);
        return routeMatch;
    }

    navigate(path) {
        const route = this.routes.filter(route => this.match(route, path))[zero];
        if (!route) {
            this.renderNode.innerHTML = '404! Page not found';
        } else {
            window.location.href = path.search('/#') === minusOne ? '#' + path : path;
            this.renderNode.innerHTML = route.renderView();
        }
    }
}

const router = (routes) => {
    const router = new Router(routes, document.getElementById('root'));
    document.addEventListener('DOMContentLoaded', e => {
        document.querySelectorAll('[route]').forEach(route => route.addEventListener('click', e => {
            e.preventDefault();
            router.navigate(e.target.getAttribute('route'));
        }, false));
    });
    window.addEventListener('hashchange', e => router.navigate(e.target.location.hash.substr(1)));
}


class StorageCtrl {
    storeItem(set) {
        let items;
        if (localStorage.getItem('items') === null) {
            items = [];
            items.push(set);
            localStorage.setItem('items', JSON.stringify(items));
        } else {
            items = JSON.parse(localStorage.getItem('items'));
            items.push(set);
            localStorage.setItem('items', JSON.stringify(items));
        }
    }

    getItemsFromStorage() {
        let items;
        if (localStorage.getItem('items') === null) {
            items = [];
        } else {
            items = JSON.parse(localStorage.getItem('items'));
        }
        return items;
    }

    updateItemStorage(updatedItem) {
        let items = JSON.parse(localStorage.getItem('items'));

        items.forEach(function(item, index) {
            if (updatedItem.id === item.id) {
                items.splice(index, 1, updatedItem);
            }
        });
        localStorage.setItem('items', JSON.stringify(items));
    }

    deleteItemFromStorage(id) {
        let items = JSON.parse(localStorage.getItem('items'));

        items.forEach(function(item, index) {
            if (id === item.id) {
                items.splice(index, 1);
            }
        });
        localStorage.setItem('items', JSON.stringify(items));
    }

    clearItemsFromStorage() {
        localStorage.removeItem('items');
    }

    storeItems(items) {
        localStorage.setItem('items', JSON.stringify(items));
    }
}

const state = {
    sets: []
}

class SetComponent {
    constructor(set) {
        this.set = set;
    }

    render() {
        let template = `
            <div class="setItem" data-id="${this.set.id}">
                <h1>${this.set.name}</h1>
                <p>Term: ${this.set.term}</p>
                <p>Definition: ${this.set.definition}</p>
            </div>`
        return template;
    }
}

class MainPageUI {
    constructor(sets) {
        this.sets = sets;
    }

    render(sets = this.sets) {
        const generatedSets = this.generateSets(sets);
        const template = `
            <div>
                <button class="goToAddNewPage btn btn-primary">Add New</button>
                <ul class="setsList list-unstyled">${generatedSets}</ul>
            </div>
        `
        return template;
    }

    generateSets(sets) {
        return sets.map((set) => {
            const setUI = new SetComponent(set);
            const setHtml = setUI.render();
            const template = ` 
            <li data-id="${set.id}" class="jumbotron my-4">
                ${setHtml}
            <div>
                <button class="goToEditSetPage btn btn-warning" data-id="${set.id}">Edit</button>
                <button data-id="${set.id}" class="removeSetButton btn btn-danger">Remove</button>
            </div>
            </li>`
            return template;
        }).join('');

    }
    removeSet(elemId) {
        const item = document.querySelector(`[data-id="${elemId}"]`);
        if (item) {
            item.parentElement.removeChild(item);
        }
    }

    reorderSets(sets) {
        const reorderedSet = this.generateSets(sets);
        const list = document.querySelector('.setsList');
        list.innerHTML = reorderedSet;
    }
}

class AddNewSetUI {
    constructor(set = {}, pageType = 'main') {
        this.set = set
        this.pageType = pageType
    }

    render() {
        let template;
        if (this.pageType === 'main') {
            template = `
            <div class="newSet">
            <p><input type="text" required class="setName form-control p-3 mb-5" placeholder="Enter your name"/></p>
            <button class="addTermsButton btn btn-primary">Add terms</button>
            <button class="saveNewSetButton btn btn-primary">Save changes</button>
            <button class="goToMain btn btn-secondary">Cancel</button>
        <div class="newSetTerms d-flex justify-content-between align-items-center mt-5"></div>
        </div>`;
        } else {
            template = `
        <div class="newSet">
            <input hidden class="setId form-control" type="text" value="${this.set.id}"/>
            <div class="form-group row">
                <label class="col-sm-2 col-form-label">Name</label>
                <p class="col-sm-10">
                    <input type="text" required value="${this.set.name}" class="setName form-control" placeholder="Name"/>
                </p>
            </div>
            <div class="my-5">
            <button class="saveNewSetButton btn btn-primary">Save changes</button>
            <button class="goToMain btn btn-secondary">Cancel</button>
            </div>
            <div class="newSetTerms">
                <div class="d-flex justify-content-between align-items-center"><label class="p-3">Term</label><p><input type="text" value="${this.set.term}" class="setTerm form-control mr-3" placeholder="Enter term"/></p>
                <label class="p-3">Definition</label><p><input type="text" value="${this.set.definition}" class="setDefinition form-control mr-3"
                 placeholder="Enter definition"/></p></<label></div>
                 <button class="removeTerms btn btn-danger mt-3">Remove</button>
            </div>

        </div>
                `;
        }

        return template
    }

    toggleTerms(isRemove = false, updateListenersFn) {
        const newSetTerms = document.querySelector('.newSetTerms');
        let termsTemplate
        if (!isRemove) {
            termsTemplate = `<input type="text" class="setTerm form-control mr-3" placeholder="Enter term"/>
            <input type="text" class="setDefinition form-control mr-3" placeholder="Enter definition"/>
            <button class="removeTerms btn btn-danger">Remove</button>`;
        } else {
            termsTemplate = ''
        }
        newSetTerms.innerHTML = termsTemplate;
        updateListenersFn();
    }
}

class ModifySetUI {
    constructor(set) {
        this.set = set;
    }

    render() {
        const setUI = new AddNewSetUI(this.set, 'edit');
        return setUI.render();
    }
}

const mainPage = new MainPageUI();
const addNewSetPage = new AddNewSetUI();
const localStore = new StorageCtrl();
const renderMainPageController = () => {
    const sets = localStore.getItemsFromStorage();
    if (sets.length > zero) {
        state.sets = sets;
    }
    return mainPage.render(state.sets);
}
const renderAddNewSetController = () => {
    return addNewSetPage.render();
}
const renderModifySetContoller = (props) => {
    const sets = localStore.getItemsFromStorage();
    if (sets.length > zero) {
        state.sets = sets;
    }
    const findedSet = state.sets.find(set => {
        return props.id === set.id
    });
    let modifySetPage;
    if (findedSet) {
        modifySetPage = new ModifySetUI(findedSet).render();
    } else {
        modifySetPage = `<p>Error</p>`;
    }
    return modifySetPage;
}

const removeSet = (e) => {
    e.preventDefault();
    const setId = e.target.dataset.id;
    localStore.deleteItemFromStorage(setId);
    const updatedSets = localStore.getItemsFromStorage();
    state.sets = updatedSets;
    mainPage.removeSet(setId);
    complitedSetClickHandler()
    removeSetButtonClickHandler()
    editClickHandler()
}

const complitedSet = (e) => {
    const setId = e.target.parentNode.dataset.id;
    const findedSet = state.sets.find(set => setId === set.id);
    const updatedSet = {
        name: findedSet.name,
        term: findedSet.term,
        definition: findedSet.definition,
        id: findedSet.id,
        complited: true
    }
    localStore.updateItemStorage(updatedSet);
    const updatedSets = localStore.getItemsFromStorage();
    const sortedAndUpdatedSets = updatedSets.sort((item1, item2) => {
        return item1.complited - item2.complited;
    });
    localStore.storeItems(sortedAndUpdatedSets);
    state.sets = sortedAndUpdatedSets;
    mainPage.reorderSets(state.sets);
    complitedSetClickHandler()
    removeSetButtonClickHandler()
    editClickHandler()
}

const addTerms = () => {
    addNewSetPage.toggleTerms(false, removeTermsClickHandler);
}

const saveNewSet = () => {
    const termEl = document.querySelector('.setTerm');
    const definitionEl = document.querySelector('.setDefinition');
    const nameEl = document.querySelector('.setName');
    const hiddenEl = document.querySelector('.setId');
    let setId = hiddenEl ? hiddenEl.value : null
    let term = termEl ? termEl.value : '';
    let definition = definitionEl ? definitionEl.value : '';
    let name = nameEl ? nameEl.value : '';
    if (name && !setId) {
        const newSet = { name, term, definition, complited: false, id: Math.floor(Math.random() * fiveHun).toString() };
        localStore.storeItem(newSet);
        location.hash = '#/';
    } else if (name && setId) {
        const oldSet = state.sets.find(set => set.id === setId)
        const updatedSet = {
            id: oldSet.id,
            complited: oldSet.complited,
            name,
            term,
            definition
        }
        localStore.updateItemStorage(updatedSet);
        location.hash = '#/';
    } else {
        console.log('Error..');
    }
}

const removeSetButtonClickHandler = () => {
    const removeSetButtons = document.querySelectorAll('.removeSetButton');
    if (!removeSetButtons) {
        return
    }
    removeSetButtons.forEach(button => {
        button.addEventListener('click', removeSet);
    });
}

const addNewSetButtonClickHandler = () => {
    const goToAddNewPage = document.querySelector('.goToAddNewPage');
    if (!goToAddNewPage) {
        return
    }
    goToAddNewPage.addEventListener('click', () => {
        location.hash = '#/add';
    })
}

const addTermsClickHandler = () => {
    const addTermsButton = document.querySelector('.addTermsButton');
    if (!addTermsButton) {
        return
    }
    addTermsButton.addEventListener('click', addTerms);
}

const saveNewSetClickHandler = () => {
    const saveNewSetButton = document.querySelector('.saveNewSetButton');
    if (!saveNewSetButton) {
        return
    }
    saveNewSetButton.addEventListener('click', saveNewSet);
}

const complitedSetClickHandler = () => {
    const setItemElem = document.querySelectorAll('.setItem');
    setItemElem.forEach(element => {
        element.addEventListener('click', complitedSet, false);
    });
}

const cancelClickHandler = () => {
    const goToMainBtn = document.querySelector('.goToMain');
    if (!goToMainBtn) {
        return
    }
    goToMainBtn.addEventListener('click', () => {
        location.hash = '#/';
    })
}

const editClickHandler = (e) => {
    const editButtons = document.querySelectorAll('.goToEditSetPage');
    if (!editButtons) {
        return
    }
    editButtons.forEach(editButton => {
        const setId = editButton.dataset.id
        editButton.addEventListener('click', () => {
            location.hash = `#/modify/${setId}`;
        })
    })
}


const removeTermsClickHandler = (e) => {
    const removeTerm = document.querySelector('.removeTerms');
    if (!removeTerm) {
        return
    }
    removeTerm.addEventListener('click', () => addNewSetPage.toggleTerms(true, removeTermsClickHandler));
}

const routes = [
    new Route('main', '/', renderMainPageController),
    new Route('add', '/add', renderAddNewSetController),
    new Route('modify', '/modify/:id', renderModifySetContoller)
];

router(routes);

document.addEventListener('DOMContentLoaded', e => {
    removeSetButtonClickHandler()
    addNewSetButtonClickHandler()
    complitedSetClickHandler()
    addTermsClickHandler();
    saveNewSetClickHandler();
    cancelClickHandler();
    editClickHandler(e)
    removeTermsClickHandler()
})

window.addEventListener('hashchange', e => {
    removeSetButtonClickHandler()
    addNewSetButtonClickHandler()
    complitedSetClickHandler()
    addTermsClickHandler();
    saveNewSetClickHandler();
    cancelClickHandler();
    editClickHandler()
    removeTermsClickHandler()
})