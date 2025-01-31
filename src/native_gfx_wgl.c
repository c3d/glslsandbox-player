/*
 * WGL Native Windowing code
 */

/*
 * This program is distributer under the 2-clause BSD license.
 * See at the end of this file for details.
 */

/*
 * See:
 * https://github.com/SaschaWillems/openglcpp/blob/master/eglExample/eglExample/eglExample/eglExample.cpp
 */

#ifdef HAVE_CONFIG_H
#include "config.h"
#endif

#include <windef.h>
#include <winuser.h>

#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <errno.h>
#include <assert.h>

#include <EGL/egl.h>

#include "native_gfx.h"

struct native_gfx_s
{
  HWND hwnd;
  HDC hdc;
  int disp_width;
  int disp_height;
  int win_width;
  int win_height;
};

static LRESULT CALLBACK
wndProc(HWND hwnd, unsigned int msg, WPARAM wParam, LPARAM lParam)
{
  switch (msg) {

    case WM_CLOSE: {
      //quit = true;
      DestroyWindow(hwnd);
      PostQuitMessage(0);
      return 0;
    }

    case WM_SIZE: {
      //winWidth = LOWORD(lParam);
      //winHeight = HIWORD(lParam);
      return 0;
    }
  }

  return (DefWindowProc(hwnd, msg, wParam, lParam));
}

static HWND
createWindow(int width, int height)
{
  HINSTANCE hInstance;
  WNDCLASSEX wcex;

  hInstance = GetModuleHandle(NULL);

  memset(&wcex, 0, sizeof (wcex));

  wcex.cbSize = sizeof(WNDCLASSEX);
  wcex.style = CS_OWNDC;
  wcex.lpfnWndProc = &DefWindowProc;
  wcex.hInstance = hInstance;
  wcex.hCursor = LoadCursor(NULL, IDC_ARROW);
  wcex.lpszClassName = "glslsandbox-player";
  wcex.lpfnWndProc = wndProc;

  RegisterClassEx(&wcex);
  RECT rect = { 0, 0, width, height };
  int style = WS_BORDER | WS_CAPTION | WS_SYSMENU | WS_THICKFRAME;
  AdjustWindowRect(&rect, style, FALSE);

  HWND hwnd = CreateWindow("glslsandbox-player",
                           "glslsandbox-player",
                           style,
                           CW_USEDEFAULT,
                           CW_USEDEFAULT,
                           rect.right - rect.left,
                           rect.bottom - rect.top,
                           NULL,
                           NULL,
                           GetModuleHandle(NULL),
                           NULL);
  ShowWindow(hwnd, SW_SHOW);

  return hwnd;
}

char *
native_gfx_get_name(void)
{
  return ("Windows WGL");
}

native_gfx_t *
native_gfx_open_display(void)
{
  native_gfx_t *gfx;

  gfx = malloc(sizeof (*gfx));
  if (gfx == NULL) {
    fprintf(stderr, "native_gfx_open_display(): Can't allocate memory: error %i: %s\n", errno, strerror(errno));
    exit(EXIT_FAILURE);
  }

  memset(gfx, 0, sizeof (*gfx));

  gfx->hwnd = createWindow(256, 256);
  if (gfx->hwnd == NULL) {
    fprintf(stderr, "native_gfx_open_display(): CreateWindow() failed\n");
    exit(EXIT_FAILURE);
  }

  gfx->hdc = GetDC(gfx->hwnd);
  if (gfx->hdc == NULL) {
    fprintf(stderr,
            "native_gfx_open_display(): "
            "Can't get device context: GetDC() failed\n");
    exit(EXIT_FAILURE);
  }

  return (gfx);
}

NativeDisplayType
native_gfx_get_egl_native_display(const native_gfx_t *gfx)
{
  return (gfx->hdc);
}

NativeWindowType
native_gfx_get_egl_native_window(const native_gfx_t *gfx)
{
  return (gfx->hwnd);
}

void
native_gfx_create_window(native_gfx_t *gfx, int width, int height, int xpos, int ypos)
{
  GFX_UNUSED(xpos);
  GFX_UNUSED(ypos);

  if (width == 0)
    width = 256;

  if (height == 0)
    height = 256;

  /* Nothing to do here.  The window was already created at display
     initialization.*/

  /* XXX: We need to resize here the window to requested value */

  gfx->win_width = width;
  gfx->win_height = height;
}

void
native_gfx_destroy_window(native_gfx_t *gfx)
{
  DestroyWindow(gfx->hwnd);
  gfx->hwnd = NULL;
  // XXX: Destroy window
}

void
native_gfx_close_display(native_gfx_t *gfx)
{
  // XXX: close display
  //gfx->disp = NULL;
  free(gfx);
}

void
native_gfx_swap_buffers(native_gfx_t *gfx)
{
  GFX_UNUSED(gfx);
}

int
native_gfx_get_window_width(const native_gfx_t *gfx)
{
  return (gfx->win_width);
}

int
native_gfx_get_window_height(const native_gfx_t *gfx)
{
  return (gfx->win_height);
}

/*
* Copyright (c) 2015-2019, Julien Olivain <juju@cotds.org>
* All rights reserved.
*
* Redistribution and use in source and binary forms, with or without
* modification, are permitted provided that the following conditions are met:
*
* * Redistributions of source code must retain the above copyright notice, this
*   list of conditions and the following disclaimer.
*
* * Redistributions in binary form must reproduce the above copyright notice,
*   this list of conditions and the following disclaimer in the documentation
*   and/or other materials provided with the distribution.
*
* THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
* AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
* IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
* DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
* FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
* DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
* SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
* CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
* OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
* OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/* End-of-File */
