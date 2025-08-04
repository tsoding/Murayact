{
    'targets': [
        {
            'target_name': 'muray',
            'sources': [
                'muray.cpp',
                'vendor/microui.c'
            ],
            'include_dirs': ['vendor/'],
            'conditions': [
                ['OS=="linux"', {
                    'include_dirs': ['vendor/raylib-5.5_linux_amd64/include'],
                    'libraries': ['-L<(module_root_dir)/vendor/raylib-5.5_linux_amd64/lib/', '-l:libraylib.a'],
                }],
                ['OS=="mac"', {
                    "include_dirs": ["vendor/raylib-5.5_macos/include"],
                    "libraries": [
                        "<(module_root_dir)/vendor/raylib-5.5_macos/lib/libraylib.550.dylib",
                    ],
                    "xcode_settings": {
                        "OTHER_LDFLAGS": [
                            "-Wl,-rpath,<(module_root_dir)/vendor/raylib-5.5_macos/lib"
                        ]
                    },
                }],
				['OS=="win"', {
                    'include_dirs': ['vendor/raylib-5.5_win64_msvc16/include'],
					"msvs_settings": {
						"VCLinkerTool": {
							"AdditionalLibraryDirectories": [ "<(module_root_dir)/vendor/raylib-5.5_win64_msvc16/lib" ],
                            "AdditionalDependencies": [ 'raylib.lib', 'winmm.lib' ],
							'IgnoreDefaultLibraryNames': [ 'libcmt.lib' ]
                        },
					},
                }],
            ],
        }
    ]
}
