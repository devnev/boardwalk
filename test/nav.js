// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { ConsoleTree } from '../src/nav.jsx';
import test from 'tape';

test("ConsoleTree returns empty root for empty console list", function(t) {
  t.deepEqual({console: null, path: "", children: {}}, ConsoleTree({}));
  t.end();
});

test("ConsoleTree places path='' in tree root", function(t) {
  var console = {c:1};
  t.deepEqual({console: console, path: "", children: {}}, ConsoleTree({"": console}));
  t.end();
});

test("ConsoleTree places path='/' in tree root with canonical path", function(t) {
  var console = {c:1};
  t.deepEqual({console: console, path: "", children: {}}, ConsoleTree({"/": console}));
  t.end();
});

test("ConsoleTree places path='///' in tree root with canonical path", function(t) {
  var console = {c:1};
  t.deepEqual({console: console, path: "", children: {}}, ConsoleTree({"///": console}));
  t.end();
});

test("ConsoleTree places path='sub' in sub node with empty root", function(t) {
  var console = {c:1};
  t.deepEqual(
      {
        console: null,
        path: "",
        children: {
          "sub": {
            console: console,
            path: "sub",
            children: {},
          },
        },
      },
      ConsoleTree({"sub": console}));
  t.end();
});

test("ConsoleTree places path='//sub' in sub node with empty root", function(t) {
  var console = {c:1};
  t.deepEqual(
      {
        console: null,
        path: "",
        children: {
          "sub": {
            console: console,
            path: "//sub",
            children: {},
          },
        },
      },
      ConsoleTree({"//sub": console}));
  t.end();
});

test("ConsoleTree places path='//sub//' in sub node with empty root", function(t) {
  var console = {c:1};
  t.deepEqual(
      {
        console: null,
        path: "",
        children: {
          "sub": {
            console: console,
            path: "//sub//",
            children: {},
          },
        },
      },
      ConsoleTree({"//sub//": console}));
  t.end();
});

test("ConsoleTree places path='sub' below path=''", function(t) {
  var root = {c:1};
  var sub = {c:2};
  t.deepEqual(
      {
        console: root,
        path: "",
        children: {
          "sub": {
            console: sub,
            path: "sub",
            children: {},
          },
        },
      },
      ConsoleTree({"": root, "sub": sub}));
  t.end();
});
