#include <print>
#include <node.h>
#include <raylib.h>

// TODO: research how to make it importable as ES6 module

void InitWindowAdapter(const v8::FunctionCallbackInfo<v8::Value> &args) {
    auto isolate = args.GetIsolate();
    auto context = isolate->GetCurrentContext();

    int width = 0;
    if (args.Length() > 0) width = args[0]->Int32Value(context).FromJust();
    std::println("width = {}", width);

    int height = 0;
    if (args.Length() > 1) height = args[1]->Int32Value(context).FromJust();
    std::println("height = {}", height);

    const char *title = "Hardcoded Title";
    if (args.Length() > 2) {
        title = strdup(*v8::String::Utf8Value(isolate, args[2]->ToString(context).ToLocalChecked())); // memory leak
    }

    InitWindow(width, height, title);
}

void WindowShouldCloseAdapter(const v8::FunctionCallbackInfo<v8::Value> &args) {
    auto isolate = args.GetIsolate();
    args.GetReturnValue().Set(v8::Boolean::New(isolate, WindowShouldClose()));
}

void BeginDrawingAdapter(const v8::FunctionCallbackInfo<v8::Value> &args) {
    BeginDrawing();
}

void EndDrawingAdapter(const v8::FunctionCallbackInfo<v8::Value> &args) {
    EndDrawing();
}

void ClearBackgroundAdapter(const v8::FunctionCallbackInfo<v8::Value> &args) {
    auto isolate = args.GetIsolate();
    auto context = isolate->GetCurrentContext();
    auto color = args[0]->Uint32Value(context).FromJust();
    ClearBackground(*(Color*)&color);
}

void Hello(const v8::FunctionCallbackInfo<v8::Value> &args) {
    auto isolate = args.GetIsolate();
    for (int i = 0; i < args.Length(); ++i) {
        std::println("{}", *v8::String::Utf8Value(isolate, args[i]));
    }

    // args.GetReturnValue().Set(v8::String::NewFromUtf8(isolate, "world", v8::NewStringType::kNormal).ToLocalChecked());
}

void Initialize(v8::Local<v8::Object> exports) {
    NODE_SET_METHOD(exports, "hello", Hello);
    NODE_SET_METHOD(exports, "InitWindow", InitWindowAdapter);
    NODE_SET_METHOD(exports, "WindowShouldClose", WindowShouldCloseAdapter);
    NODE_SET_METHOD(exports, "BeginDrawing", BeginDrawingAdapter);
    NODE_SET_METHOD(exports, "EndDrawing", EndDrawingAdapter);
    NODE_SET_METHOD(exports, "ClearBackground", ClearBackgroundAdapter);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)
