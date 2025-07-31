CXXFLAGS=\
	-std=c++23\
	-I$(HOME)/opt/raylib-5.5_linux_amd64/include\
	-I$(HOME)/opt/node/include/node\
	-ggdb\
	-Wall\
	-Wextra\
	-shared\
	-fPIC\

LIBS=\
	-L$(HOME)/opt/raylib-5.5_linux_amd64/lib\
	-l:libraylib.a\

all: bundle.js native.js raylib.node

bundle.js: browser.js App.js
	./node_modules/.bin/browserify browser.js -o bundle.js

%.js: %.jsx
	./node_modules/.bin/babel $< --presets @babel/preset-react -o $@

raylib.node: raylib.cpp
	g++ $(CXXFLAGS) -o raylib.node raylib.cpp $(LIBS)
