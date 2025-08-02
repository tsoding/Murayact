const React = require('react');
const Reconciler = require('react-reconciler');
const raylib = require('./raylib.node');
const { App } = require('./App.js');

const TRACE = false;

const hostConfig = {
    noTimeout: -1,
    isPrimaryRenderer: true,
    supportsMutation: true,
    supportsPersistence: false,
    supportsHydration: false,
    getRootHostContext: (...args) => {
        if (TRACE) console.log('getRootHostContext', args);
        return "urmom";
    },
    prepareForCommit: (...args) => {
        if (TRACE) console.log('prepareForCommit', args);
        return null;
    },
    resetAfterCommit: (...args) => {
        if (TRACE) console.log('resetAfterCommit', args);
    },
    getChildHostContext: (...args) => {
        if (TRACE) console.log('getChildHostContext', args);
        return "urchild"
    },
    shouldSetTextContent(type, props) {
        if (TRACE) console.log('shouldSetTextContent', type, props);
        const childrenType = typeof props.children;
        if (childrenType === 'string' || childrenType == 'number') return true;
        return false;
    },
    createTextInstance(text, _rootContainerInstance, _hostContext) {
        if (TRACE) console.log('createTextInstance');
        return {
            type: 'text',
            text
        };
    },
    createInstance(
        type,
        props,
        rootContainerInstance,
        _hostContext,
    ) {
        if (TRACE) console.log("createInstance");
        const elementProps = { ...props };
        delete elementProps.children;
        const element = {type, ...elementProps, children: []};
        if (type === 'Text') {
            throw 'TODO';
        }
        return element;
    },
    appendInitialChild(parentInstance, child) {
        if (TRACE) console.log('appendInitialChild');
        parentInstance.children.push(child);
    },
    finalizeInitialChildren(...args) {
        if (TRACE) console.log('finalizeInitialChildren', args);
        return true;
    },
    clearContainer(rootContainerInstance) {
        if (TRACE) console.log('clearContainer', rootContainerInstance);
        rootContainerInstance.children = [];
    },
    appendChildToContainer(rootContainerInstance, child) {
        if (TRACE) console.log('appendChildToContainer', rootContainerInstance, child);
        rootContainerInstance.children.push(child);
    },
    commitMount(instance, type, newProps) {
        if (TRACE) console.log('commitMount', instance, type, newProps);
    },
    prepareUpdate(
        instance,
        type,
        oldProps,
        newProps,
        _rootContainerInstance,
        _hostContext,
    ) {
        if (TRACE) console.log('prepareUpdate');
        const changes = {
            props: [],
            style: [],
        };
        for (let key in { ...oldProps, ...newProps }) {
            if (oldProps[key] !== newProps[key]) {
                changes.props.push(key);
            }
        }
        for (let key in { ...oldProps.style, ...newProps.style }) {
            if (oldProps.style[key] !== newProps.style[key]) {
                changes.style.push(key);
            }
        }
        // const updatePayload = changes.props.length || changes.style.length ? { changes } : null;
        return changes;
    },
    commitTextUpdate(textInstance, oldText, newText) {
        textInstance.text = newText;
        if (TRACE) console.log('commitTextUpdate', textInstance, oldText, newText);
    },
    commitUpdate(
        instance,
        updatePayload,
        type,
        oldProps,
        newProps,
    ) {
        if (TRACE) console.log('commitUpdate', args);
        for (let prop of updatePayload.props) {
            if (prop !== 'children') {
                instance[prop] = newProps[prop];
            }
        }
    },
};
const RaylibRenderer = Reconciler(hostConfig);

const container = RaylibRenderer.createContainer(
    {type: 'window'},
    0,
    // null,
    // false,
    // null,
    // 'react_raylib_',
    // (_err) => undefined,
    // null
);
RaylibRenderer.updateContainer(<App />, container);

function renderTextElement(element) {
    if (element.type === 'text') {
        return element.text;
    }
    console.log(element);
    throw 'Not text!';
}
function renderElement(element) {
    switch (element.type) {
    case 'window':
        raylib.mu_begin_window();
        for (let child of element.children) {
            renderElement(child);
        }
        raylib.mu_end_window();
        break;
    case 'button':
        let label = "";
        for (let child of element.children) {
            label += renderTextElement(child);
        }
        if (raylib.mu_button(label)) {
            element.onClick();
        }
        break;
    default:
        throw 'TODO';
    }
}

raylib.InitWindow(800, 600, "Hello from JavaScript");
while (!raylib.WindowShouldClose()) {
    raylib.mu_update_input();
    raylib.BeginDrawing();
    {
        raylib.ClearBackground(0xFF181818);
        raylib.mu_begin();
        {
            renderElement(container.containerInfo);
        }
        raylib.mu_end();
    }
    raylib.EndDrawing();
}
