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
            ],
        }
    ]
}
