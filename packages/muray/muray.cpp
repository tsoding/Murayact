// Node.js plugin that integrates together Raylib and MicroUI
#ifdef __LINUX__
#include <print>
#endif
#include <string.h>
#include <vector>
#include <node.h>
#include <raylib.h>
extern "C" {
    #include "microui.h"
}

#define FONT_SIZE 20
#define BUFFER_SIZE 2048

static mu_Context ctx = {0};

struct InputField
{
    std::string id;
    std::string buffer;

    std::vector<char> cbuf;
    InputField(const std::string &_id, const std::string initial = "", int bufsize = BUFFER_SIZE) : 
    id(_id), buffer(initial), cbuf(bufsize, 0)
    {
        strncpy(cbuf.data(), initial.c_str(), bufsize - 1);
    }

    char *data()
    {
        return cbuf.data();
    }

    int size()
    {
        return cbuf.size();
    }

    void sync()
    {
        buffer = cbuf.data();
    }
};

struct InputList
{
    std::vector<InputField> items;

    void add(const std::string &id, const std::string &initial = "", int bufsize = BUFFER_SIZE)
    {
        items.emplace_back(id, initial, bufsize);
    }

    bool checkID(const std::string &id)
    {
        for (auto &field : items)
        {
            if(field.id == id)
                return true;
        }
        return false;
    }

    void render(mu_Context *ctx, char* id, const v8::FunctionCallbackInfo<v8::Value> &args)
    {

        if(!this->checkID(id)) this->add(id);
        for (auto &field : items)
        {
            if(field.id == id) {
                int val = mu_textbox(ctx, field.data(), field.size());
                if (val & MU_RES_CHANGE)
                {
                    field.sync();
                    mu_set_focus(ctx, ctx->last_id);
                    auto isolate = args.GetIsolate();
                    args.GetReturnValue().Set(v8::String::NewFromUtf8(isolate, field.data()).ToLocalChecked());
                }
            }
        }
    }
};

static InputList inputs;

static mu_Rect unclipped_rect = { 0, 0, 0x1000000, 0x1000000 };

void MuButton(const v8::FunctionCallbackInfo<v8::Value> &args) {
    auto isolate = args.GetIsolate();
    auto context = isolate->GetCurrentContext();
    bool result = mu_button(&ctx, *v8::String::Utf8Value(isolate, args[0]->ToString(context).ToLocalChecked()));
    args.GetReturnValue().Set(v8::Boolean::New(isolate, result));
}

void MuLabel(const v8::FunctionCallbackInfo<v8::Value> &args) {
    auto isolate = args.GetIsolate();
    auto context = isolate->GetCurrentContext();
    auto label = *v8::String::Utf8Value(isolate, args[0]->ToString(context).ToLocalChecked());
    mu_label(&ctx, *v8::String::Utf8Value(isolate, args[0]->ToString(context).ToLocalChecked()));
}

void MuInput(const v8::FunctionCallbackInfo<v8::Value> &args) {
    auto isolate = args.GetIsolate();
    auto context = isolate->GetCurrentContext();
    auto id = *v8::String::Utf8Value(isolate, args[0]->ToString(context).ToLocalChecked());
    inputs.render(&ctx, id, args);
}

void MuBeginWindow(const v8::FunctionCallbackInfo<v8::Value> &args) {
    mu_begin_window(&ctx, "Murayact", mu_rect(20, 20, 300, 300));
    mu_layout_row(&ctx, 2, (int[]) { 300, -1 }, 50);
}

void MuEndWindow(const v8::FunctionCallbackInfo<v8::Value> &args) {
    mu_end_window(&ctx);
}

void MuUpdateInput(const v8::FunctionCallbackInfo<v8::Value> &args) {
    int x = GetMouseX();
    int y = GetMouseY();
    mu_input_mousemove(&ctx, x, y);
    for (int button = MOUSE_BUTTON_LEFT; button <= MOUSE_BUTTON_MIDDLE; ++button) {
        if (IsMouseButtonPressed (button)) mu_input_mousedown(&ctx, x, y, 1 << button);
        if (IsMouseButtonReleased(button)) mu_input_mouseup  (&ctx, x, y, 1 << button);
    }

    int key;
    while ((key = GetCharPressed())) {
        mu_input_text(&ctx, (char[2]){(char)key, 0});
    }

    if(IsKeyPressed(KEY_BACKSPACE) || IsKeyPressedRepeat(KEY_BACKSPACE))  mu_input_keydown(&ctx, MU_KEY_BACKSPACE);
    if(IsKeyReleased(KEY_BACKSPACE)) mu_input_keyup(&ctx, MU_KEY_BACKSPACE);

    // I might be dumb, but i don't think MicroUI supports up down left right
    // if(IsKeyPressed(KEY_LEFT))       mu_input_keydown(&ctx, MU_KEY_LEFT);
    // if(IsKeyReleased(KEY_LEFT))      mu_input_keyup(&ctx, MU_KEY_LEFT);

    // if(IsKeyPressed(KEY_RIGHT))      mu_input_keydown(&ctx, MU_KEY_RIGHT);
    // if(IsKeyReleased(KEY_RIGHT))     mu_input_keyup(&ctx, MU_KEY_RIGHT);
}

void MuBegin(const v8::FunctionCallbackInfo<v8::Value> &args) {
    mu_begin(&ctx);
}

void MuEnd(const v8::FunctionCallbackInfo<v8::Value> &args) {
    mu_end(&ctx);

    mu_Command *cmd = NULL;
    while (mu_next_command(&ctx, &cmd)) {
        switch (cmd->type) {
        case MU_COMMAND_JUMP: printf("MU_COMMAND_JUMP\n"); break;
        case MU_COMMAND_CLIP: {
            int posX   = cmd->clip.rect.x;
            int posY   = cmd->clip.rect.y;
            int width  = cmd->clip.rect.w;
            int height = cmd->clip.rect.h;
            if (memcmp(&cmd->clip.rect, &unclipped_rect, sizeof(unclipped_rect)) == 0) {
                EndScissorMode();
            } else {
                BeginScissorMode(posX, posY, width, height);
            }
        } break;
        case MU_COMMAND_RECT: {
            int posX   = cmd->rect.rect.x;
            int posY   = cmd->rect.rect.y;
            int width  = cmd->rect.rect.w;
            int height = cmd->rect.rect.h;
            DrawRectangle(posX, posY, width, height, *(Color*)&cmd->rect.color);
        } break;
        case MU_COMMAND_TEXT: {
            DrawText(cmd->text.str, cmd->text.pos.x, cmd->text.pos.y, FONT_SIZE, *(Color*)&cmd->text.color);
        } break;
        // case MU_COMMAND_ICON: printf("MU_COMMAND_ICON\n"); break;
    }
}
}

void InitWindowAdapter(const v8::FunctionCallbackInfo<v8::Value> &args) {
    auto isolate = args.GetIsolate();
    auto context = isolate->GetCurrentContext();

    int width = 0;
    if (args.Length() > 0) width = args[0]->Int32Value(context).FromJust();

    int height = 0;
    if (args.Length() > 1) height = args[1]->Int32Value(context).FromJust();

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

int text_width(mu_Font font, const char *str, int len)
{
    int x = MeasureText(TextFormat("%.*s", len, str), FONT_SIZE);
    return x;
}

int text_height(mu_Font font)
{
    return FONT_SIZE;
}

void Initialize(v8::Local<v8::Object> exports) {
    mu_init(&ctx);
    ctx.text_width = text_width;
    ctx.text_height = text_height;

    NODE_SET_METHOD(exports, "InitWindow", InitWindowAdapter);
    NODE_SET_METHOD(exports, "WindowShouldClose", WindowShouldCloseAdapter);
    NODE_SET_METHOD(exports, "BeginDrawing", BeginDrawingAdapter);
    NODE_SET_METHOD(exports, "EndDrawing", EndDrawingAdapter);
    NODE_SET_METHOD(exports, "ClearBackground", ClearBackgroundAdapter);
    NODE_SET_METHOD(exports, "mu_update_input", MuUpdateInput);
    NODE_SET_METHOD(exports, "mu_begin", MuBegin);
    NODE_SET_METHOD(exports, "mu_end", MuEnd);
    NODE_SET_METHOD(exports, "mu_begin_window", MuBeginWindow);
    NODE_SET_METHOD(exports, "mu_end_window", MuEndWindow);
    NODE_SET_METHOD(exports, "mu_button", MuButton);
    NODE_SET_METHOD(exports, "mu_label", MuLabel);
    NODE_SET_METHOD(exports, "mu_input", MuInput);
}

NODE_MODULE(NODE_GYP_MODULE_NAME, Initialize)
