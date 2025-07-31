const React = require('react');
const Reconciler = require('react-reconciler');
const raylib = require('./raylib.node');
const { App } = require('./App.js');

const RaylibRenderer = Reconciler({
    resolveUpdatePriority: (...args) => {
        console.log("resolveUpdatePriority", args, this);
        return 0;
    },
});

console.log(RaylibRenderer);

const container = RaylibRenderer.createContainer({});

raylib.InitWindow(800, 600, "Hello from JavaScript");
while (!raylib.WindowShouldClose()) {
    RaylibRenderer.updateContainer(<App />, container, null, callback);
    raylib.BeginDrawing();
    raylib.ClearBackground(0xFF181818);
    raylib.EndDrawing();
}
