/*
 * GLSL Sandbox shader player
 */

/*
 * This program is distributer under the 2-clause BSD license.
 * See at the end of this file for details.
 */

#ifndef GLSLSANDBOX_PLAYER_H
#define GLSLSANDBOX_PLAYER_H

#include <GLES2/gl2.h>
#include <time.h>

#include "egl_helper.h"

#define Timespec_Float(t) ((float)((t)->tv_sec) + (1.e-9 * (float)((t)->tv_nsec)))

#define Timespec_Sub(r, a, b) \
    do { \
        if ((a)->tv_nsec < (b)->tv_nsec) { \
            (r)->tv_nsec = 1000000000 + (a)->tv_nsec - (b)->tv_nsec; \
            (r)->tv_sec = (a)->tv_sec - (b)->tv_sec - 1; \
        } else { \
            (r)->tv_nsec = (a)->tv_nsec - (b)->tv_nsec; \
            (r)->tv_sec  = (a)->tv_sec  - (b)->tv_sec; \
        } \
    } while (0)

typedef struct context_s context_t;
struct context_s {
  egl_t *egl;
  GLint a_pos, a_uv, a_surfacePosition;
  GLint u_time, u_mouse, u_resolution, u_surfaceSize;
  GLuint gl_prog;
  GLuint vertex_shader;
  GLuint fragment_shader;
  struct timespec player_start_time;
  struct timespec render_start_time;
  struct timespec first_frame_time;
  struct timespec warmup_end_time;
  struct timespec last_fps_count_time;
  float time;
  float time_factor;
  float run_time;
  unsigned int frame;
  unsigned int frames;
  unsigned int warmup_frames;
  int report_fps_count;
  int verbose;
  int print_shader;
  int enable_mouse_emu;
  float mouse_emu_speed;
  int enable_surfpos_anim;
  float surfpos_anim_speed;
  int run_shader;
  int height;
  int width;
  char *user_shader;
};

#endif /* GLSLSANDBOX_PLAYER_H */

/*
* Copyright (c) 2015, Julien Olivain <juju@cotds.org>
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
