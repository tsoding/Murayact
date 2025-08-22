const React = require('react');
const Reconciler = require('react-reconciler');
const muray = require('muray');

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
        // Documentation for shouldSetTextContent says you have to manage creating the text nodes in createInstance when this returns true.
        // const childrenType = typeof props.children;
        // if (childrenType === 'string' || childrenType == 'number') return true;
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
        const element = { type, ...elementProps, children: [] };
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
        if (TRACE) console.log('commitUpdate', instance, oldProps, newProps);
        for (let prop of updatePayload.props) {
            if (prop !== 'children') {
                instance[prop] = newProps[prop];
            }
        }
    },
};
const MurayRenderer = Reconciler(hostConfig);

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
            {
                muray.mu_begin_window();
                for (let child of element.children) {
                    renderElement(child);
                }
                muray.mu_end_window();
            } break;
        case 'div':
            {
                for (let child of element.children) {
                    renderElement(child);
                }
            } break;
        case 'button':
            {
                let label = "";
                for (let child of element.children) {
                    label += renderTextElement(child);
                }
                if (muray.mu_button(label)) {
                    element.onClick();
                }
            } break;
        case 'label':
            {
                let label = "";
                for (let child of element.children) {
                    label += renderTextElement(child);
                }
                muray.mu_label(label);
            } break;
        case 'input':
            {
                let placeholder = element.placeholder || "";
                muray.mu_label(placeholder);
                if (element.id == undefined || element.id == "") throw "MISSING ID FOR TEXT INPUT";
                let value = muray.mu_input(element.id);
                if (value) {
                    const evt = { target: { value } };
                    element.onChange(evt);
                }
            } break;
        default:
            throw 'TODO';
    }
}

exports.render = (element) => {
    const container = MurayRenderer.createContainer(
        { type: 'window' },
        0,
        // null,
        // false,
        // null,
        // 'react_raylib_',
        // (_err) => undefined,
        // null
    );
    MurayRenderer.updateContainer(element, container);

    muray.InitWindow(800, 600, "Hello from JavaScript");
    while (!muray.WindowShouldClose()) {
        muray.mu_update_input();
        muray.BeginDrawing();
        {
            muray.ClearBackground(0xFF181818);
            muray.mu_begin();
            {
                renderElement(container.containerInfo);
            }
            muray.mu_end();
        }
        muray.EndDrawing();
    }
}
