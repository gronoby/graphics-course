#pragma once

#include <etna/Window.hpp>
#include <etna/PerFrameCmdMgr.hpp>
#include <etna/ComputePipeline.hpp>
#include <etna/GraphicsPipeline.hpp>
#include <etna/Image.hpp>
#include "wsi/OsWindowingManager.hpp"

#include <chrono>
#include <etna/Sampler.hpp>
#include <etna/BlockingTransferHelper.hpp>


class App
{
public:
  App();
  ~App();

  void run();

private:
  void drawFrame();

private:
  OsWindowingManager windowing;
  std::unique_ptr<OsWindow> osWindow;

  glm::uvec2 resolution;
  bool useVsync;

  std::unique_ptr<etna::Window> vkWindow;
  std::unique_ptr<etna::PerFrameCmdMgr> commandManager;

  etna::ComputePipeline et_pipeline;
  etna::Image et_image;
  etna::Sampler et_sampler;

  std::unique_ptr<etna::BlockingTransferHelper> transferHelper;
  etna::Image fileTextureImage;
  etna::Sampler fileTextureSampler;

  etna::GraphicsPipeline shaderPipeline;
  std::vector<etna::Buffer> constantsBuffers;
  unsigned cur_frame;

  std::chrono::system_clock::time_point timeStart;
  struct Params
{
  glm::uvec2 iResolution;
  glm::uvec2 iMouse;
  float iTime;
};
};