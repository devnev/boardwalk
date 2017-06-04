// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.

import { connect } from 'react-redux';
import * as React from 'react';
import { FormatTemplate } from '../fmt';
import { MatchFilter } from '../match';

export interface Link {
  url: string;
  text: string;
  match: {[label: string]: string};
}

interface SectionProps {
  title: string;
  links: Link[];
}

export function Section(props: SectionProps): JSX.Element {
  return (
    <div>
      <h2>{props.title}</h2>
      <LinksList links={props.links} />
    </div>
  );
}

function LinksList(props: {links: Link[]}): JSX.Element {
  return (
    <ul>
      {props.links.map((link, index) => (
        <FilteredLink key={index} match={link.match} url={link.url} text={link.text} />
      ))}
    </ul>
  );
}

type FilterLinkProps = Link & {filter: {[label: string]: string}};

class FilterLink extends React.Component<FilterLinkProps, {}> {
  render(): JSX.Element | null {
    if (!MatchFilter(this.props.match, this.props.filter)) {
      return null;
    }
    var url = FormatTemplate(this.props.url, this.props.filter);
    var text = FormatTemplate(this.props.text, this.props.filter);
    return <li><a href={url}>{text}</a></li>;
  }
}

const FilteredLink: React.ComponentClass<Link> = connect(
  (state) => ({
    filter: state.filter,
  })
)(FilterLink);
