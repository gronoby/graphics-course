
add_executable(local_shadertoy2
  main.cpp
  App.cpp
)

target_link_libraries(local_shadertoy2
  PRIVATE glfw etna glm::glm wsi gui scene)

target_add_shaders(local_shadertoy2
  shaders/toy.frag
  shaders/toy_vert.vert
  shaders/toy_proc.comp
)
