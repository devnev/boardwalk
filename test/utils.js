// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import test from 'tape';
import { FormatMetric, FormatTemplate, MatchFilter } from '../src/utils.jsx';

test('FormatMetric with no labels returns empty', function(t) {
  t.plan(1);
  t.equal("", FormatMetric({}));
});

test('FormatMetric for plain rule returns name', function(t) {
  t.plan(1);
  t.equal("rule_name", FormatMetric({__name__: "rule_name"}));
});

test('FormatMetric for single label uses braces', function(t) {
  t.plan(1);
  t.equal("{job=\"some_job\"}", FormatMetric({job: "some_job"}));
});

test('FormatMetric for multiple labels joins them with commas', function(t) {
  t.plan(1);
  t.equal("{job=\"some_job\",instance=\"0\"}", FormatMetric({job: "some_job", instance: "0"}));
});

test('FormatMetric for label and name uses braces prefixed by name', function(t) {
  t.plan(1);
  t.equal("rule_name{job=\"some_job\"}", FormatMetric({__name__: "rule_name", job: "some_job"}));
});

test('FormatTemplate with empty template and props returns empty string', function(t) {
  t.plan(1);
  t.equal("", FormatTemplate("", {}));
});

test("FormatTemplate with plain text returns text", function(t) {
  t.plan(1);
  t.equal("a test text", FormatTemplate("a test text", {a: "prop"}));
});

test("FormatTemplate with a ref inserts that prop", function(t) {
  t.plan(2);
  t.equal("text", FormatTemplate("${ref}", {ref: "text", other: "nope"}));
  t.equal("Insert text here", FormatTemplate("Insert ${ref} here", {ref: "text", other: "nope"}));
});

test("FormatTemplate with empty ref inserts a dollar sign", function(t) {
  t.plan(2);
  t.equal("$", FormatTemplate("${}", {ref: "text"}));
  t.equal("Insert $ here", FormatTemplate("Insert ${} here", {ref: "text", other: "nope"}));
});

test("MatchFilter with falsey match returns true", function(t) {
  t.plan(3);
  t.equal(true, MatchFilter(false, {job: "j"}));
  t.equal(true, MatchFilter(undefined, {instance: "i"}));
  t.equal(true, MatchFilter(null, {__name__: "r"}));
});

test("MatchFilter with empty match matches empty filter only", function(t) {
  t.plan(3);
  t.equal(true, MatchFilter({}, {}));
  t.equal(false, MatchFilter({}, {job: "j"}));
  t.equal(false, MatchFilter({}, {__name__: "n"}));
});

test("MatchFilter with dot-plus regex matches filter with corresponding non-empty value", function(t) {
  t.equal(false, MatchFilter({job: ".+"}, {}));
  t.equal(false, MatchFilter({job: ".+"}, {job: ""}));
  t.equal(true, MatchFilter({job: ".+"}, {job: "j"}));
  t.equal(false, MatchFilter({job: ".+"}, {job: "j", __name__: "r"}));
  t.end();
});
