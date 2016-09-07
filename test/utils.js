// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import test from 'tape';
import { FormatMetric, FormatTemplate, MatchFilter, StrictMatchFilter } from '../src/utils.jsx';

test('FormatMetric', (t) => {
  t.test('FormatMetric with no labels returns empty', function(t) {
    t.plan(1);
    t.equal("", FormatMetric({}));
  });

  t.test('FormatMetric for plain rule returns name', function(t) {
    t.plan(1);
    t.equal("rule_name", FormatMetric({__name__: "rule_name"}));
  });

  t.test('FormatMetric for single label uses braces', function(t) {
    t.plan(1);
    t.equal("{job=\"some_job\"}", FormatMetric({job: "some_job"}));
  });

  t.test('FormatMetric for multiple labels joins them with commas', function(t) {
    t.plan(1);
    t.equal("{job=\"some_job\",instance=\"0\"}", FormatMetric({job: "some_job", instance: "0"}));
  });

  t.test('FormatMetric for label and name uses braces prefixed by name', function(t) {
    t.plan(1);
    t.equal("rule_name{job=\"some_job\"}", FormatMetric({__name__: "rule_name", job: "some_job"}));
  });
});

test('FormatTemplate', (t) => {
  t.test('FormatTemplate with empty template and props returns empty string', function(t) {
    t.plan(1);
    t.equal("", FormatTemplate("", {}));
  });

  t.test("FormatTemplate with plain text returns text", function(t) {
    t.plan(1);
    t.equal("a test text", FormatTemplate("a test text", {a: "prop"}));
  });

  t.test("FormatTemplate with a ref inserts that prop", function(t) {
    t.plan(2);
    t.equal("text", FormatTemplate("${ref}", {ref: "text", other: "nope"}));
    t.equal("Insert text here", FormatTemplate("Insert ${ref} here", {ref: "text", other: "nope"}));
  });

  t.test("FormatTemplate with empty ref inserts a dollar sign", function(t) {
    t.plan(2);
    t.equal("$", FormatTemplate("${}", {ref: "text"}));
    t.equal("Insert $ here", FormatTemplate("Insert ${} here", {ref: "text", other: "nope"}));
  });
});

test('MatchFilter', (t) => {
  t.test("MatchFilter with falsey match returns true", function(t) {
    t.plan(3);
    t.equal(true, MatchFilter(false, {job: "j"}));
    t.equal(true, MatchFilter(undefined, {instance: "i"}));
    t.equal(true, MatchFilter(null, {__name__: "r"}));
  });
});

test('StrictMatchFilter', (t) => {
  t.test("StrictMatchFilter with falsey match returns false", function(t) {
    t.plan(3);
    t.equal(false, StrictMatchFilter(false, {job: "j"}));
    t.equal(false, StrictMatchFilter(undefined, {instance: "i"}));
    t.equal(false, StrictMatchFilter(null, {__name__: "r"}));
  });

  t.test("StrictMatchFilter with empty match matches empty filter only", function(t) {
    t.plan(3);
    t.equal(true, StrictMatchFilter({}, {}));
    t.equal(false, StrictMatchFilter({}, {job: "j"}));
    t.equal(false, StrictMatchFilter({}, {__name__: "n"}));
  });

  t.test("StrictMatchFilter with dot-plus regex matches filter with corresponding non-empty value", function(t) {
    t.equal(false, StrictMatchFilter({job: ".+"}, {}));
    t.equal(false, StrictMatchFilter({job: ".+"}, {job: ""}));
    t.equal(true, StrictMatchFilter({job: ".+"}, {job: "j"}));
    t.equal(false, StrictMatchFilter({job: ".+"}, {job: "j", __name__: "r"}));
    t.end();
  });
});
