/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {act, fireEvent, render as renderComponent, within} from '@testing-library/react';
import {Cell, Column, Row, Table, TableBody, TableHeader} from '../';
import {CRUDExample} from '../stories/CRUDExample';
import {Link} from '@react-spectrum/link';
import {Provider} from '@react-spectrum/provider';
import React from 'react';
import {Switch} from '@react-spectrum/switch';
import {theme} from '@react-spectrum/theme-default';
import {triggerPress} from '@react-spectrum/test-utils';
import userEvent from '@testing-library/user-event';

let columns = [
  {name: 'Foo', key: 'foo'},
  {name: 'Bar', key: 'bar'},
  {name: 'Baz', key: 'baz'}
];

let nestedColumns = [
  {name: 'Test', key: 'test'},
  {name: 'Tiered One Header', key: 'tier1', children: [
    {name: 'Tier Two Header A', key: 'tier2a', children: [
      {name: 'Foo', key: 'foo'},
      {name: 'Bar', key: 'bar'}
    ]},
    {name: 'Yay', key: 'yay'},
    {name: 'Tier Two Header B', key: 'tier2b', children: [
      {name: 'Baz', key: 'baz'}
    ]}
  ]}
];

let items = [
  {test: 'Test 1', foo: 'Foo 1', bar: 'Bar 1', yay: 'Yay 1', baz: 'Baz 1'},
  {test: 'Test 2', foo: 'Foo 2', bar: 'Bar 2', yay: 'Yay 2', baz: 'Baz 2'}
];

describe('Table', function () {
  let offsetWidth, offsetHeight;
  beforeAll(function () {
    offsetWidth = jest.spyOn(window.HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(() => 1000);
    offsetHeight = jest.spyOn(window.HTMLElement.prototype, 'clientHeight', 'get').mockImplementation(() => 1000);
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
    jest.useFakeTimers();
  });

  afterAll(function () {
    offsetWidth.mockReset();
    offsetHeight.mockReset();
  });

  let render = (children, scale = 'medium') => renderComponent(
    <Provider theme={theme} scale={scale}>
      {children}
    </Provider>
  );

  let rerender = (tree, children, scale = 'medium') => tree.rerender(
    <Provider theme={theme} scale={scale}>
      {children}
    </Provider>
  );

  it('renders a static table', function () {
    let {getByRole} = render(
      <Table>
        <TableHeader>
          <Column>Foo</Column>
          <Column>Bar</Column>
          <Column>Baz</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>Foo 1</Cell>
            <Cell>Bar 1</Cell>
            <Cell>Baz 1</Cell>
          </Row>
          <Row>
            <Cell>Foo 2</Cell>
            <Cell>Bar 2</Cell>
            <Cell>Baz 2</Cell>
          </Row>
        </TableBody>
      </Table>
    );

    let grid = getByRole('grid');
    expect(grid).toBeVisible();
    expect(grid).toHaveAttribute('aria-multiselectable', 'true');
    expect(grid).toHaveAttribute('aria-rowcount', '3');
    expect(grid).toHaveAttribute('aria-colcount', '4');

    let rowgroups = within(grid).getAllByRole('rowgroup');
    expect(rowgroups).toHaveLength(2);

    let headerRows = within(rowgroups[0]).getAllByRole('row');
    expect(headerRows).toHaveLength(1);
    expect(headerRows[0]).toHaveAttribute('aria-rowindex', '1');

    let headers = within(grid).getAllByRole('columnheader');
    expect(headers).toHaveLength(4);
    expect(headers[0]).toHaveAttribute('aria-colindex', '1');
    expect(headers[1]).toHaveAttribute('aria-colindex', '2');
    expect(headers[2]).toHaveAttribute('aria-colindex', '3');
    expect(headers[3]).toHaveAttribute('aria-colindex', '4');

    for (let header of headers) {
      expect(header).not.toHaveAttribute('aria-sort');
    }

    let checkbox = within(headers[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select All');

    expect(headers[1]).toHaveTextContent('Foo');
    expect(headers[2]).toHaveTextContent('Bar');
    expect(headers[3]).toHaveTextContent('Baz');

    let rows = within(rowgroups[1]).getAllByRole('row');
    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveAttribute('aria-rowindex', '2');
    expect(rows[1]).toHaveAttribute('aria-rowindex', '3');

    let rowheader = within(rows[0]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Foo 1');
    expect(rowheader).toHaveAttribute('aria-colindex', '2');

    expect(rows[0]).toHaveAttribute('aria-selected', 'false');
    expect(rows[0]).toHaveAttribute('aria-labelledby', rowheader.id);

    checkbox = within(rows[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheader.id}`);

    rowheader = within(rows[1]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Foo 2');
    expect(rowheader).toHaveAttribute('aria-colindex', '2');

    expect(rows[1]).toHaveAttribute('aria-selected', 'false');
    expect(rows[1]).toHaveAttribute('aria-labelledby', rowheader.id);


    checkbox = within(rows[1]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheader.id}`);

    let cells = within(rowgroups[1]).getAllByRole('gridcell');
    expect(cells).toHaveLength(6);

    expect(cells[0]).toHaveAttribute('aria-colindex', '1');
    expect(cells[1]).toHaveAttribute('aria-colindex', '3');
    expect(cells[2]).toHaveAttribute('aria-colindex', '4');
    expect(cells[3]).toHaveAttribute('aria-colindex', '1');
    expect(cells[4]).toHaveAttribute('aria-colindex', '3');
    expect(cells[5]).toHaveAttribute('aria-colindex', '4');
  });

  it('renders a dynamic table', function () {
    let {getByRole} = render(
      <Table>
        <TableHeader columns={columns} columnKey="key">
          {column => <Column>{column.name}</Column>}
        </TableHeader>
        <TableBody items={items} itemKey="foo">
          {item =>
            (<Row>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    );

    let grid = getByRole('grid');
    expect(grid).toBeVisible();
    expect(grid).toHaveAttribute('aria-multiselectable', 'true');
    expect(grid).toHaveAttribute('aria-rowcount', '3');
    expect(grid).toHaveAttribute('aria-colcount', '4');

    let rowgroups = within(grid).getAllByRole('rowgroup');
    expect(rowgroups).toHaveLength(2);

    let headerRows = within(rowgroups[0]).getAllByRole('row');
    expect(headerRows).toHaveLength(1);
    expect(headerRows[0]).toHaveAttribute('aria-rowindex', '1');

    let headers = within(grid).getAllByRole('columnheader');
    expect(headers).toHaveLength(4);
    expect(headers[0]).toHaveAttribute('aria-colindex', '1');
    expect(headers[1]).toHaveAttribute('aria-colindex', '2');
    expect(headers[2]).toHaveAttribute('aria-colindex', '3');
    expect(headers[3]).toHaveAttribute('aria-colindex', '4');

    let checkbox = within(headers[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select All');

    expect(headers[1]).toHaveTextContent('Foo');
    expect(headers[2]).toHaveTextContent('Bar');
    expect(headers[3]).toHaveTextContent('Baz');

    let rows = within(rowgroups[1]).getAllByRole('row');
    expect(rows).toHaveLength(2);

    let rowheader = within(rows[0]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Foo 1');
    expect(rowheader).toHaveAttribute('aria-colindex', '2');

    expect(rows[0]).toHaveAttribute('aria-selected', 'false');
    expect(rows[0]).toHaveAttribute('aria-labelledby', rowheader.id);

    checkbox = within(rows[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheader.id}`);

    rowheader = within(rows[1]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Foo 2');
    expect(rowheader).toHaveAttribute('aria-colindex', '2');

    expect(rows[1]).toHaveAttribute('aria-selected', 'false');
    expect(rows[1]).toHaveAttribute('aria-labelledby', rowheader.id);


    checkbox = within(rows[1]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheader.id}`);

    let cells = within(rowgroups[1]).getAllByRole('gridcell');
    expect(cells).toHaveLength(6);

    expect(cells[0]).toHaveAttribute('aria-colindex', '1');
    expect(cells[1]).toHaveAttribute('aria-colindex', '3');
    expect(cells[2]).toHaveAttribute('aria-colindex', '4');
    expect(cells[3]).toHaveAttribute('aria-colindex', '1');
    expect(cells[4]).toHaveAttribute('aria-colindex', '3');
    expect(cells[5]).toHaveAttribute('aria-colindex', '4');
  });

  it('renders a static table with nested columns', function () {
    let {getByRole} = render(
      <Table>
        <TableHeader>
          <Column key="test">Test</Column>
          <Column title="Group 1">
            <Column key="foo">Foo</Column>
            <Column key="bar">Bar</Column>
          </Column>
          <Column title="Group 2">
            <Column key="baz">Baz</Column>
          </Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>Test 1</Cell>
            <Cell>Foo 1</Cell>
            <Cell>Bar 1</Cell>
            <Cell>Baz 1</Cell>
          </Row>
          <Row>
            <Cell>Test 2</Cell>
            <Cell>Foo 2</Cell>
            <Cell>Bar 2</Cell>
            <Cell>Baz 2</Cell>
          </Row>
        </TableBody>
      </Table>
    );

    let grid = getByRole('grid');
    expect(grid).toBeVisible();
    expect(grid).toHaveAttribute('aria-multiselectable', 'true');
    expect(grid).toHaveAttribute('aria-rowcount', '4');
    expect(grid).toHaveAttribute('aria-colcount', '5');

    let rowgroups = within(grid).getAllByRole('rowgroup');
    expect(rowgroups).toHaveLength(2);

    let headerRows = within(rowgroups[0]).getAllByRole('row');
    expect(headerRows).toHaveLength(2);
    expect(headerRows[0]).toHaveAttribute('aria-rowindex', '1');
    expect(headerRows[1]).toHaveAttribute('aria-rowindex', '2');

    let headers = within(headerRows[0]).getAllByRole('columnheader');
    let placeholderCells = within(headerRows[0]).getAllByRole('gridcell');
    expect(headers).toHaveLength(2);
    expect(placeholderCells).toHaveLength(1);

    expect(placeholderCells[0]).toHaveTextContent('');
    expect(placeholderCells[0]).toHaveAttribute('aria-colspan', '2');
    expect(placeholderCells[0]).toHaveAttribute('aria-colindex', '1');

    expect(headers[0]).toHaveTextContent('Group 1');
    expect(headers[0]).toHaveAttribute('aria-colspan', '2');
    expect(headers[0]).toHaveAttribute('aria-colindex', '3');
    expect(headers[1]).toHaveTextContent('Group 2');
    expect(headers[1]).toHaveAttribute('aria-colindex', '5');

    headers = within(headerRows[1]).getAllByRole('columnheader');
    expect(headers).toHaveLength(5);
    expect(headers[0]).toHaveAttribute('aria-colindex', '1');
    expect(headers[1]).toHaveAttribute('aria-colindex', '2');
    expect(headers[2]).toHaveAttribute('aria-colindex', '3');
    expect(headers[3]).toHaveAttribute('aria-colindex', '4');
    expect(headers[4]).toHaveAttribute('aria-colindex', '5');

    let checkbox = within(headers[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select All');

    expect(headers[1]).toHaveTextContent('Test');
    expect(headers[2]).toHaveTextContent('Foo');
    expect(headers[3]).toHaveTextContent('Bar');
    expect(headers[4]).toHaveTextContent('Baz');

    let rows = within(rowgroups[1]).getAllByRole('row');
    expect(rows).toHaveLength(2);

    let rowheader = within(rows[0]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Test 1');

    expect(rows[0]).toHaveAttribute('aria-selected', 'false');
    expect(rows[0]).toHaveAttribute('aria-labelledby', rowheader.id);
    expect(rows[0]).toHaveAttribute('aria-rowindex', '3');

    checkbox = within(rows[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheader.id}`);

    rowheader = within(rows[1]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Test 2');

    expect(rows[1]).toHaveAttribute('aria-selected', 'false');
    expect(rows[1]).toHaveAttribute('aria-labelledby', rowheader.id);
    expect(rows[1]).toHaveAttribute('aria-rowindex', '4');


    checkbox = within(rows[1]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheader.id}`);

    let cells = within(rowgroups[1]).getAllByRole('gridcell');
    expect(cells).toHaveLength(8);
  });

  it('renders a dynamic table with nested columns', function () {
    let {getByRole} = render(
      <Table>
        <TableHeader columns={nestedColumns} columnKey="key">
          {column =>
            <Column childColumns={column.children}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={items} itemKey="foo">
          {item =>
            (<Row>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    );

    let grid = getByRole('grid');
    expect(grid).toBeVisible();
    expect(grid).toHaveAttribute('aria-multiselectable', 'true');
    expect(grid).toHaveAttribute('aria-rowcount', '5');
    expect(grid).toHaveAttribute('aria-colcount', '6');

    let rowgroups = within(grid).getAllByRole('rowgroup');
    expect(rowgroups).toHaveLength(2);

    let headerRows = within(rowgroups[0]).getAllByRole('row');
    expect(headerRows).toHaveLength(3);
    expect(headerRows[0]).toHaveAttribute('aria-rowindex', '1');
    expect(headerRows[1]).toHaveAttribute('aria-rowindex', '2');
    expect(headerRows[2]).toHaveAttribute('aria-rowindex', '3');

    let headers = within(headerRows[0]).getAllByRole('columnheader');
    let placeholderCells = within(headerRows[0]).getAllByRole('gridcell');
    expect(headers).toHaveLength(1);
    expect(placeholderCells).toHaveLength(1);

    expect(placeholderCells[0]).toHaveTextContent('');
    expect(placeholderCells[0]).toHaveAttribute('aria-colspan', '2');
    expect(placeholderCells[0]).toHaveAttribute('aria-colindex', '1');
    expect(headers[0]).toHaveTextContent('Tiered One Header');
    expect(headers[0]).toHaveAttribute('aria-colspan', '4');
    expect(headers[0]).toHaveAttribute('aria-colindex', '3');

    headers = within(headerRows[1]).getAllByRole('columnheader');
    placeholderCells = within(headerRows[1]).getAllByRole('gridcell');
    expect(headers).toHaveLength(2);
    expect(placeholderCells).toHaveLength(2);

    expect(placeholderCells[0]).toHaveTextContent('');
    expect(placeholderCells[0]).toHaveAttribute('aria-colspan', '2');
    expect(placeholderCells[0]).toHaveAttribute('aria-colindex', '1');
    expect(headers[0]).toHaveTextContent('Tier Two Header A');
    expect(headers[0]).toHaveAttribute('aria-colspan', '2');
    expect(headers[0]).toHaveAttribute('aria-colindex', '3');
    expect(placeholderCells[1]).toHaveTextContent('');
    expect(placeholderCells[1]).toHaveAttribute('aria-colindex', '5');
    expect(headers[1]).toHaveTextContent('Tier Two Header B');
    expect(headers[1]).toHaveAttribute('aria-colindex', '6');

    headers = within(headerRows[2]).getAllByRole('columnheader');
    expect(headers).toHaveLength(6);

    let checkbox = within(headers[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select All');

    expect(headers[1]).toHaveTextContent('Test');
    expect(headers[2]).toHaveTextContent('Foo');
    expect(headers[3]).toHaveTextContent('Bar');
    expect(headers[4]).toHaveTextContent('Yay');
    expect(headers[5]).toHaveTextContent('Baz');

    let rows = within(rowgroups[1]).getAllByRole('row');
    expect(rows).toHaveLength(2);

    let rowheader = within(rows[0]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Test 1');

    expect(rows[0]).toHaveAttribute('aria-selected', 'false');
    expect(rows[0]).toHaveAttribute('aria-labelledby', rowheader.id);
    expect(rows[0]).toHaveAttribute('aria-rowindex', '4');

    checkbox = within(rows[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheader.id}`);

    rowheader = within(rows[1]).getByRole('rowheader');
    expect(rowheader).toHaveTextContent('Test 2');

    expect(rows[1]).toHaveAttribute('aria-selected', 'false');
    expect(rows[1]).toHaveAttribute('aria-labelledby', rowheader.id);
    expect(rows[1]).toHaveAttribute('aria-rowindex', '5');


    checkbox = within(rows[1]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheader.id}`);

    let cells = within(rowgroups[1]).getAllByRole('gridcell');
    expect(cells).toHaveLength(10);
  });

  it('renders a table with multiple row headers', function () {
    let {getByRole} = render(
      <Table>
        <TableHeader>
          <Column isRowHeader>First Name</Column>
          <Column isRowHeader>Last Name</Column>
          <Column>Birthday</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>Sam</Cell>
            <Cell>Smith</Cell>
            <Cell>May 3</Cell>
          </Row>
          <Row>
            <Cell>Julia</Cell>
            <Cell>Jones</Cell>
            <Cell>February 10</Cell>
          </Row>
        </TableBody>
      </Table>
    );

    let grid = getByRole('grid');
    let rowgroups = within(grid).getAllByRole('rowgroup');
    let rows = within(rowgroups[1]).getAllByRole('row');

    let rowheaders = within(rows[0]).getAllByRole('rowheader');
    expect(rowheaders).toHaveLength(2);
    expect(rowheaders[0]).toHaveTextContent('Sam');
    expect(rowheaders[1]).toHaveTextContent('Smith');

    expect(rows[0]).toHaveAttribute('aria-labelledby', `${rowheaders[0].id} ${rowheaders[1].id}`);

    let checkbox = within(rows[0]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheaders[0].id} ${rowheaders[1].id}`);

    rowheaders = within(rows[1]).getAllByRole('rowheader');
    expect(rowheaders).toHaveLength(2);
    expect(rowheaders[0]).toHaveTextContent('Julia');
    expect(rowheaders[1]).toHaveTextContent('Jones');

    expect(rows[1]).toHaveAttribute('aria-labelledby', `${rowheaders[0].id} ${rowheaders[1].id}`);

    checkbox = within(rows[1]).getByRole('checkbox');
    expect(checkbox).toHaveAttribute('aria-label', 'Select');
    expect(checkbox).toHaveAttribute('aria-labelledby', `${checkbox.id} ${rowheaders[0].id} ${rowheaders[1].id}`);
  });

  describe('keyboard focus', function () {
    let renderTable = (locale = 'en-US') => render(
      <Provider locale={locale} theme={theme}>
        <Table selectionMode="none">
          <TableHeader columns={columns} columnKey="key">
            {column => <Column>{column.name}</Column>}
          </TableHeader>
          <TableBody items={items} itemKey="foo">
            {item =>
              (<Row>
                {key => <Cell>{item[key]}</Cell>}
              </Row>)
            }
          </TableBody>
        </Table>
      </Provider>
    );

    let renderNested = () => render(
      <Table selectionMode="none">
        <TableHeader columns={nestedColumns} columnKey="key">
          {column =>
            <Column childColumns={column.children}>{column.name}</Column>
          }
        </TableHeader>
        <TableBody items={items} itemKey="foo">
          {item =>
            (<Row>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    );

    let focusCell = (tree, text) => tree.getByText(text).focus();
    let moveFocus = (key, opts = {}) => fireEvent.keyDown(document.activeElement, {key, ...opts});

    describe('ArrowRight', function () {
      it('should move focus to the next cell in a row with ArrowRight', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 1');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getByText('Baz 1'));
      });

      it('should move focus to the previous cell in a row with ArrowRight in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Bar 1');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getByText('Foo 1'));
      });

      it('should move focus to the row when on the last cell with ArrowRight', function () {
        let tree = renderTable();
        focusCell(tree, 'Baz 1');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[1]);
      });

      it('should move focus to the row when on the first cell with ArrowRight in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Foo 1');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[1]);
      });

      it('should move focus from the row to the first cell with ArrowRight', function () {
        let tree = renderTable();
        tree.getAllByRole('row')[1].focus();
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getByText('Foo 1'));
      });

      it('should move focus from the row to the last cell with ArrowRight in RTL', function () {
        let tree = renderTable('ar-AE');
        tree.getAllByRole('row')[1].focus();
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getByText('Baz 1'));
      });

      it('should move to the next column header in a row with ArrowRight', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getByText('Baz'));
      });

      it('should move to the previous column header in a row with ArrowRight in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Bar');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getByText('Foo'));
      });

      it('should move to the first column header when focus is on the last column with ArrowRight', function () {
        let tree = renderTable();
        focusCell(tree, 'Baz');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getByText('Foo'));
      });

      it('should move to the last column header when focus is on the first column with ArrowRight in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Foo');
        moveFocus('ArrowRight');
        expect(document.activeElement).toBe(tree.getByText('Baz'));
      });
    });

    describe('ArrowLeft', function () {
      it('should move focus to the previous cell in a row with ArrowLeft', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 1');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getByText('Foo 1'));
      });

      it('should move focus to the next cell in a row with ArrowRight in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Bar 1');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getByText('Baz 1'));
      });

      it('should move focus to the row when on the first cell with ArrowLeft', function () {
        let tree = renderTable();
        focusCell(tree, 'Foo 1');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[1]);
      });

      it('should move focus to the row when on the last cell with ArrowLeft in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Baz 1');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[1]);
      });

      it('should move focus from the row to the last cell with ArrowLeft', function () {
        let tree = renderTable();
        tree.getAllByRole('row')[1].focus();
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getByText('Baz 1'));
      });

      it('should move focus from the row to the first cell with ArrowLeft in RTL', function () {
        let tree = renderTable('ar-AE');
        tree.getAllByRole('row')[1].focus();
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getByText('Foo 1'));
      });

      it('should move to the previous column header in a row with ArrowLeft', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getByText('Foo'));
      });

      it('should move to the next column header in a row with ArrowLeft in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Bar');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getByText('Baz'));
      });

      it('should move to the last column header when focus is on the first column with ArrowLeft', function () {
        let tree = renderTable();
        focusCell(tree, 'Foo');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getByText('Baz'));
      });

      it('should move to the first column header when focus is on the last column with ArrowLeft in RTL', function () {
        let tree = renderTable('ar-AE');
        focusCell(tree, 'Baz');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getByText('Foo'));
      });
    });

    describe('ArrowUp', function () {
      it('should move focus to the cell above with ArrowUp', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 2');
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(tree.getByText('Bar 1'));
      });

      it('should move focus to the row above with ArrowUp', function () {
        let tree = renderTable();
        tree.getAllByRole('row')[2].focus();
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[1]);
      });

      it('should move focus to the column header above a cell in the first row with ArrowUp', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 1');
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(tree.getByText('Bar'));
      });

      it('should move focus to the column header above the first row with ArrowUp', function () {
        let tree = renderTable();
        tree.getAllByRole('row')[1].focus();
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(tree.getByText('Foo'));
      });

      it('should move focus to the parent column header with ArrowUp', function () {
        let tree = renderNested();
        focusCell(tree, 'Bar');
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(tree.getByText('Tier Two Header A'));
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(tree.getByText('Tiered One Header'));
        // do nothing when at the top
        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(tree.getByText('Tiered One Header'));
      });
    });

    describe('ArrowDown', function () {
      it('should move focus to the cell below with ArrowDown', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 1');
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(tree.getByText('Bar 2'));
      });

      it('should move focus to the row below with ArrowDown', function () {
        let tree = renderTable();
        tree.getAllByRole('row')[1].focus();
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[2]);
      });

      it('should move focus to the child column header with ArrowDown', function () {
        let tree = renderNested();
        focusCell(tree, 'Tiered One Header');
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(tree.getByText('Tier Two Header A'));
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(tree.getByText('Foo'));
      });

      it('should move focus to the cell below a column header with ArrowDown', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar');
        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(tree.getByText('Bar 1'));
      });
    });

    describe('Home', function () {
      it('should focus the first cell in a row with Home', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 1');
        moveFocus('Home');
        expect(document.activeElement).toBe(tree.getByText('Foo 1'));
      });

      it('should focus the first cell in the first row with ctrl + Home', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 2');
        moveFocus('Home', {ctrlKey: true});
        expect(document.activeElement).toBe(tree.getByText('Foo 1'));
      });

      it('should focus the first row with Home', function () {
        let tree = renderTable();
        tree.getAllByRole('row')[2].focus();
        moveFocus('Home');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[1]);
      });
    });

    describe('End', function () {
      it('should focus the last cell in a row with End', function () {
        let tree = renderTable();
        focusCell(tree, 'Foo 1');
        moveFocus('End');
        expect(document.activeElement).toBe(tree.getByText('Baz 1'));
      });

      it('should focus the last cell in the last row with ctrl + End', function () {
        let tree = renderTable();
        focusCell(tree, 'Bar 1');
        moveFocus('End', {ctrlKey: true});
        expect(document.activeElement).toBe(tree.getByText('Baz 2'));
      });

      it('should focus the last row with End', function () {
        let tree = renderTable();
        tree.getAllByRole('row')[1].focus();
        moveFocus('End');
        expect(document.activeElement).toBe(tree.getAllByRole('row')[2]);
      });
    });

    // TODO: PageUp and PageDown once scrolling is supported
    // TODO: type to select once that is figured out

    describe('focus marshalling', function () {
      let renderFocusable = () => render(
        <Table>
          <TableHeader>
            <Column>Foo</Column>
            <Column>Bar</Column>
            <Column>baz</Column>
          </TableHeader>
          <TableBody>
            <Row>
              <Cell textValue="Foo 1"><Switch aria-label="Foo 1" /></Cell>
              <Cell textValue="Google"><Link><a href="https://google.com" target="_blank">Google</a></Link></Cell>
              <Cell>Baz 1</Cell>
            </Row>
            <Row>
              <Cell textValue="Foo 2"><Switch aria-label="Foo 2" /></Cell>
              <Cell textValue="Yahoo"><Link><a href="https://yahoo.com" target="_blank">Yahoo</a></Link></Cell>
              <Cell>Baz 2</Cell>
            </Row>
          </TableBody>
        </Table>
      );

      it('should marshall focus to the focusable element inside a cell', function () {
        let tree = renderFocusable();
        focusCell(tree, 'Baz 1');
        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getAllByRole('link')[0]);

        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getAllByRole('switch')[0]);

        moveFocus('ArrowDown');
        expect(document.activeElement).toBe(tree.getAllByRole('switch')[1]);

        moveFocus('ArrowLeft');
        expect(document.activeElement).toBe(tree.getAllByRole('checkbox')[2]);

        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(tree.getAllByRole('checkbox')[1]);

        moveFocus('ArrowUp');
        expect(document.activeElement).toBe(tree.getAllByRole('checkbox')[0]);
      });
    });
  });

  describe('selection', function () {
    let renderTable = (onSelectionChange, locale = 'en-US') => render(
      <Table onSelectionChange={onSelectionChange}>
        <TableHeader columns={columns} columnKey="key">
          {column => <Column>{column.name}</Column>}
        </TableHeader>
        <TableBody items={items} itemKey="foo">
          {item =>
            (<Row>
              {key => <Cell>{item[key]}</Cell>}
            </Row>)
          }
        </TableBody>
      </Table>
    );

    let checkSelection = (onSelectionChange, selectedKeys) => {
      expect(onSelectionChange).toHaveBeenCalledTimes(1);
      expect(new Set(onSelectionChange.mock.calls[0][0])).toEqual(new Set(selectedKeys));
    };

    let checkSelectAll = (tree, state = 'indeterminate') => {
      let checkbox = tree.getByLabelText('Select All');
      if (state === 'indeterminate') {
        expect(checkbox.indeterminate).toBe(true);
      } else {
        expect(checkbox.checked).toBe(state === 'checked');
      }
    };

    it('should select a row from checkbox', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      let row = tree.getAllByRole('row')[1];
      expect(row).toHaveAttribute('aria-selected', 'false');
      act(() => userEvent.click(within(row).getByRole('checkbox')));

      checkSelection(onSelectionChange, ['Foo 1']);
      expect(row).toHaveAttribute('aria-selected', 'true');
      checkSelectAll(tree);
    });

    it('should select a row by pressing on a cell', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      let row = tree.getAllByRole('row')[1];
      expect(row).toHaveAttribute('aria-selected', 'false');
      act(() => triggerPress(tree.getByText('Baz 1')));

      checkSelection(onSelectionChange, ['Foo 1']);
      expect(row).toHaveAttribute('aria-selected', 'true');
      checkSelectAll(tree);
    });

    it('should select a row by pressing the Space key on a row', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      let row = tree.getAllByRole('row')[1];
      expect(row).toHaveAttribute('aria-selected', 'false');
      act(() => {fireEvent.keyDown(row, {key: ' '});});

      checkSelection(onSelectionChange, ['Foo 1']);
      expect(row).toHaveAttribute('aria-selected', 'true');
      checkSelectAll(tree);
    });

    it('should select a row by pressing the Enter key on a row', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      let row = tree.getAllByRole('row')[1];
      expect(row).toHaveAttribute('aria-selected', 'false');
      act(() => {fireEvent.keyDown(row, {key: 'Enter'});});

      checkSelection(onSelectionChange, ['Foo 1']);
      expect(row).toHaveAttribute('aria-selected', 'true');
      checkSelectAll(tree);
    });

    it('should select a row by pressing the Space key on a cell', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      let row = tree.getAllByRole('row')[1];
      expect(row).toHaveAttribute('aria-selected', 'false');
      act(() => {fireEvent.keyDown(tree.getByText('Bar 1'), {key: ' '});});

      checkSelection(onSelectionChange, ['Foo 1']);
      expect(row).toHaveAttribute('aria-selected', 'true');
      checkSelectAll(tree);
    });

    it('should select a row by pressing the Enter key on a cell', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      let row = tree.getAllByRole('row')[1];
      expect(row).toHaveAttribute('aria-selected', 'false');
      act(() => {fireEvent.keyDown(tree.getByText('Bar 1'), {key: 'Enter'});});

      checkSelection(onSelectionChange, ['Foo 1']);
      expect(row).toHaveAttribute('aria-selected', 'true');
      checkSelectAll(tree);
    });

    it('should support selecting multiple', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      checkSelectAll(tree, 'unchecked');

      let rows = tree.getAllByRole('row');
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');
      expect(rows[2]).toHaveAttribute('aria-selected', 'false');
      act(() => triggerPress(tree.getByText('Baz 1')));

      checkSelection(onSelectionChange, ['Foo 1']);
      expect(rows[1]).toHaveAttribute('aria-selected', 'true');
      expect(rows[2]).toHaveAttribute('aria-selected', 'false');
      checkSelectAll(tree, 'indeterminate');

      onSelectionChange.mockReset();
      act(() => triggerPress(tree.getByText('Baz 2')));

      checkSelection(onSelectionChange, ['Foo 1', 'Foo 2']);
      expect(rows[1]).toHaveAttribute('aria-selected', 'true');
      expect(rows[2]).toHaveAttribute('aria-selected', 'true');
      checkSelectAll(tree, 'checked');
    });

    it('should support selecting all via the checkbox', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      checkSelectAll(tree, 'unchecked');

      let rows = tree.getAllByRole('row');
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');
      expect(rows[2]).toHaveAttribute('aria-selected', 'false');

      act(() => userEvent.click(tree.getByLabelText('Select All')));

      checkSelection(onSelectionChange, ['Foo 1', 'Foo 2']);
      expect(rows[1]).toHaveAttribute('aria-selected', 'true');
      expect(rows[2]).toHaveAttribute('aria-selected', 'true');
      checkSelectAll(tree, 'checked');
    });

    it('should support selecting all via ctrl + A', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      checkSelectAll(tree, 'unchecked');

      let rows = tree.getAllByRole('row');
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');
      expect(rows[2]).toHaveAttribute('aria-selected', 'false');

      act(() => {fireEvent.keyDown(tree.getByText('Bar 1'), {key: 'a', ctrlKey: true});});

      checkSelection(onSelectionChange, ['Foo 1', 'Foo 2']);
      expect(rows[1]).toHaveAttribute('aria-selected', 'true');
      expect(rows[2]).toHaveAttribute('aria-selected', 'true');
      checkSelectAll(tree, 'checked');
    });

    it('should support clearing selection via Escape', function () {
      let onSelectionChange = jest.fn();
      let tree = renderTable(onSelectionChange);

      checkSelectAll(tree, 'unchecked');

      let rows = tree.getAllByRole('row');
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');
      expect(rows[2]).toHaveAttribute('aria-selected', 'false');
      act(() => triggerPress(tree.getByText('Baz 1')));
      checkSelectAll(tree, 'indeterminate');

      onSelectionChange.mockReset();
      act(() => {fireEvent.keyDown(tree.getByText('Bar 1'), {key: 'Escape'});});

      checkSelection(onSelectionChange, []);
      expect(rows[1]).toHaveAttribute('aria-selected', 'false');
      expect(rows[2]).toHaveAttribute('aria-selected', 'false');
      checkSelectAll(tree, 'unchecked');
    });
  });

  describe('CRUD', function () {
    it('can add items', function () {
      let tree = render(<Provider theme={theme}><CRUDExample /></Provider>);

      let table = tree.getByRole('grid');
      let rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(3);

      let button = tree.getByLabelText('Add item');
      act(() => triggerPress(button));

      let dialog = tree.getByRole('dialog');
      expect(dialog).toBeVisible();

      let firstName = tree.getByLabelText('First Name');
      act(() => {userEvent.type(firstName, 'Devon');});

      let lastName = tree.getByLabelText('Last Name');
      act(() => {userEvent.type(lastName, 'Govett');});

      let birthday = tree.getByLabelText('Birthday');
      act(() => {userEvent.type(birthday, 'Feb 3');});

      let createButton = tree.getByText('Create');
      act(() => triggerPress(createButton));

      expect(dialog).not.toBeInTheDocument();

      act(() => jest.runAllTimers());

      rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(4);

      let rowHeaders = within(rows[1]).getAllByRole('rowheader');
      expect(rowHeaders[0]).toHaveTextContent('Devon');
      expect(rowHeaders[1]).toHaveTextContent('Govett');

      let cells = within(rows[1]).getAllByRole('gridcell');
      expect(cells[1]).toHaveTextContent('Feb 3');
    });

    it('can remove items', function () {
      let tree = render(<Provider theme={theme}><CRUDExample /></Provider>);

      let table = tree.getByRole('grid');
      let rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(3);

      let button = within(rows[2]).getByRole('button');
      act(() => triggerPress(button));

      let menu = tree.getByRole('menu');
      expect(document.activeElement).toBe(menu);

      let menuItems = within(menu).getAllByRole('menuitem');
      expect(menuItems.length).toBe(2);

      act(() => triggerPress(menuItems[1]));
      expect(menu).not.toBeInTheDocument();

      let dialog = tree.getByRole('alertdialog', {hidden: true});
      let deleteButton = within(dialog).getByRole('button', {hidden: true});

      act(() => triggerPress(deleteButton));
      expect(dialog).not.toBeInTheDocument();

      act(() => jest.runAllTimers());
      expect(rows[2]).not.toBeInTheDocument();

      rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(2);

      let rowHeaders = within(rows[1]).getAllByRole('rowheader');
      expect(rowHeaders[0]).toHaveTextContent('Sam');
    });

    it('can bulk remove items', function () {
      let tree = render(<Provider theme={theme}><CRUDExample /></Provider>);

      let table = tree.getByRole('grid');
      let rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(3);

      let checkbox = within(rows[0]).getByRole('checkbox');
      act(() => userEvent.click(checkbox));
      expect(checkbox.checked).toBe(true);

      let deleteButton = tree.getByLabelText('Delete selected items');
      act(() => triggerPress(deleteButton));

      let dialog = tree.getByRole('alertdialog');
      let confirmButton = within(dialog).getByRole('button');

      act(() => triggerPress(confirmButton));
      expect(dialog).not.toBeInTheDocument();

      act(() => jest.runAllTimers());

      rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(1);

      expect(checkbox.checked).toBe(false);
    });

    it('can edit items', function () {
      let tree = render(<Provider theme={theme}><CRUDExample /></Provider>);

      let table = tree.getByRole('grid');
      let rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(3);

      let button = within(rows[2]).getByRole('button');
      act(() => triggerPress(button));

      let menu = tree.getByRole('menu');
      expect(document.activeElement).toBe(menu);

      let menuItems = within(menu).getAllByRole('menuitem');
      expect(menuItems.length).toBe(2);

      act(() => triggerPress(menuItems[0]));
      expect(menu).not.toBeInTheDocument();

      let dialog = tree.getByRole('dialog', {hidden: true});
      expect(dialog).toBeVisible();

      let firstName = tree.getByLabelText('First Name');
      act(() => {userEvent.type(firstName, 'Jessica');});

      let saveButton = tree.getByText('Save');
      act(() => triggerPress(saveButton));

      expect(dialog).not.toBeInTheDocument();

      act(() => jest.runAllTimers());

      let rowHeaders = within(rows[2]).getAllByRole('rowheader');
      expect(rowHeaders[0]).toHaveTextContent('Jessica');
      expect(rowHeaders[1]).toHaveTextContent('Jones');
    });
  });

  describe('async loading', function () {
    let defaultTable = (
      <Table>
        <TableHeader>
          <Column uniqueKey="foo">Foo</Column>
          <Column uniqueKey="bar">Bar</Column>
        </TableHeader>
        <TableBody>
          <Row>
            <Cell>Foo 1</Cell>
            <Cell>Bar 1</Cell>
          </Row>
          <Row>
            <Cell>Foo 2</Cell>
            <Cell>Bar 2</Cell>
          </Row>
        </TableBody>
      </Table>
    );

    it('should display a spinner when loading', function () {
      let tree = render(
        <Table>
          <TableHeader>
            <Column uniqueKey="foo">Foo</Column>
            <Column uniqueKey="bar">Bar</Column>
          </TableHeader>
          <TableBody isLoading>
            {[]}
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(2);
      expect(rows[1]).toHaveAttribute('aria-rowindex', '2');

      let cell = within(rows[1]).getByRole('rowheader');
      expect(cell).toHaveAttribute('aria-colspan', '3');

      let spinner = within(cell).getByRole('progressbar');
      expect(spinner).toBeVisible();
      expect(spinner).toHaveAttribute('aria-label', 'Loading...');
      expect(spinner).not.toHaveAttribute('aria-valuenow');

      rerender(tree, defaultTable);
      act(() => jest.runAllTimers());

      rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(3);
      expect(spinner).not.toBeInTheDocument();
    });

    it('should display a spinner at the bottom when loading more', function () {
      let tree = render(
        <Table>
          <TableHeader>
            <Column uniqueKey="foo">Foo</Column>
            <Column uniqueKey="bar">Bar</Column>
          </TableHeader>
          <TableBody isLoading>
            <Row>
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
            </Row>
            <Row>
              <Cell>Foo 2</Cell>
              <Cell>Bar 2</Cell>
            </Row>
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(4);
      expect(rows[3]).toHaveAttribute('aria-rowindex', '4');

      let cell = within(rows[3]).getByRole('rowheader');
      expect(cell).toHaveAttribute('aria-colspan', '3');

      let spinner = within(cell).getByRole('progressbar');
      expect(spinner).toBeVisible();
      expect(spinner).toHaveAttribute('aria-label', 'Loading more...');
      expect(spinner).not.toHaveAttribute('aria-valuenow');

      rerender(tree, defaultTable);
      act(() => jest.runAllTimers());

      rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(3);
      expect(spinner).not.toBeInTheDocument();
    });

    it('should fire onLoadMore when scrolling near the bottom', function () {
      let items = [];
      for (let i = 1; i <= 100; i++) {
        items.push({id: i, foo: 'Foo ' + i, bar: 'Bar ' + i});
      }

      let onLoadMore = jest.fn();
      let tree = render(
        <Table>
          <TableHeader>
            <Column uniqueKey="foo">Foo</Column>
            <Column uniqueKey="bar">Bar</Column>
          </TableHeader>
          <TableBody items={items} onLoadMore={onLoadMore}>
            {row => (
              <Row>
                {key => <Cell>row[key]</Cell>}
              </Row>
            )}
          </TableBody>
        </Table>
      );

      let body = tree.getAllByRole('rowgroup')[1];
      let scrollView = body.parentNode.parentNode;

      let rows = within(body).getAllByRole('row');
      expect(rows).toHaveLength(21); // each row is 49px tall. table is 1000px tall. 21 rows fit.

      scrollView.scrollTop = 250;
      fireEvent.scroll(scrollView);

      scrollView.scrollTop = 1500;
      fireEvent.scroll(scrollView);

      scrollView.scrollTop = 2800;
      fireEvent.scroll(scrollView);

      scrollView.scrollTop = 3500;
      fireEvent.scroll(scrollView);

      expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it('should display an empty state when there are no items', function () {
      let tree = render(
        <Table renderEmptyState={() => <h3>No results</h3>}>
          <TableHeader>
            <Column uniqueKey="foo">Foo</Column>
            <Column uniqueKey="bar">Bar</Column>
          </TableHeader>
          <TableBody>
            {[]}
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(2);
      expect(rows[1]).toHaveAttribute('aria-rowindex', '2');

      let cell = within(rows[1]).getByRole('rowheader');
      expect(cell).toHaveAttribute('aria-colspan', '3');

      let heading = within(cell).getByRole('heading');
      expect(heading).toBeVisible();
      expect(heading).toHaveTextContent('No results');

      rerender(tree, defaultTable);
      act(() => jest.runAllTimers());

      rows = within(table).getAllByRole('row');
      expect(rows).toHaveLength(3);
      expect(heading).not.toBeInTheDocument();
    });
  });

  describe('sorting', function () {
    it('should set aria-sort="none" on sortable column headers', function () {
      let tree = render(
        <Table selectionMode="none">
          <TableHeader>
            <Column uniqueKey="foo" allowsSorting>Foo</Column>
            <Column uniqueKey="bar" allowsSorting>Bar</Column>
            <Column uniqueKey="baz">Baz</Column>
          </TableHeader>
          <TableBody>
            <Row>
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
              <Cell>Baz 1</Cell>
            </Row>
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let columnheaders = within(table).getAllByRole('columnheader');
      expect(columnheaders).toHaveLength(3);
      expect(columnheaders[0]).toHaveAttribute('aria-sort', 'none');
      expect(columnheaders[1]).toHaveAttribute('aria-sort', 'none');
      expect(columnheaders[2]).not.toHaveAttribute('aria-sort');
    });

    it('should set aria-sort="ascending" on sorted column header', function () {
      let tree = render(
        <Table selectionMode="none" sortDescriptor={{column: 'bar', direction: 'ascending'}}>
          <TableHeader>
            <Column uniqueKey="foo" allowsSorting>Foo</Column>
            <Column uniqueKey="bar" allowsSorting>Bar</Column>
            <Column uniqueKey="baz">Baz</Column>
          </TableHeader>
          <TableBody>
            <Row>
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
              <Cell>Baz 1</Cell>
            </Row>
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let columnheaders = within(table).getAllByRole('columnheader');
      expect(columnheaders).toHaveLength(3);
      expect(columnheaders[0]).toHaveAttribute('aria-sort', 'none');
      expect(columnheaders[1]).toHaveAttribute('aria-sort', 'ascending');
      expect(columnheaders[2]).not.toHaveAttribute('aria-sort');
    });

    it('should set aria-sort="descending" on sorted column header', function () {
      let tree = render(
        <Table selectionMode="none" sortDescriptor={{column: 'bar', direction: 'descending'}}>
          <TableHeader>
            <Column uniqueKey="foo" allowsSorting>Foo</Column>
            <Column uniqueKey="bar" allowsSorting>Bar</Column>
            <Column uniqueKey="baz">Baz</Column>
          </TableHeader>
          <TableBody>
            <Row>
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
              <Cell>Baz 1</Cell>
            </Row>
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let columnheaders = within(table).getAllByRole('columnheader');
      expect(columnheaders).toHaveLength(3);
      expect(columnheaders[0]).toHaveAttribute('aria-sort', 'none');
      expect(columnheaders[1]).toHaveAttribute('aria-sort', 'descending');
      expect(columnheaders[2]).not.toHaveAttribute('aria-sort');
    });

    it('should fire onSortChange when there is no existing sortDescriptor', function () {
      let onSortChange = jest.fn();
      let tree = render(
        <Table selectionMode="none" onSortChange={onSortChange}>
          <TableHeader>
            <Column uniqueKey="foo" allowsSorting>Foo</Column>
            <Column uniqueKey="bar" allowsSorting>Bar</Column>
            <Column uniqueKey="baz">Baz</Column>
          </TableHeader>
          <TableBody>
            <Row>
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
              <Cell>Baz 1</Cell>
            </Row>
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let columnheaders = within(table).getAllByRole('columnheader');
      expect(columnheaders).toHaveLength(3);
      expect(columnheaders[0]).toHaveAttribute('aria-sort', 'none');
      expect(columnheaders[1]).toHaveAttribute('aria-sort', 'none');
      expect(columnheaders[2]).not.toHaveAttribute('aria-sort');

      act(() => triggerPress(columnheaders[0]));

      expect(onSortChange).toHaveBeenCalledTimes(1);
      expect(onSortChange).toHaveBeenCalledWith({column: 'foo', direction: 'ascending'});
    });

    it('should toggle the sort direction from ascending to descending', function () {
      let onSortChange = jest.fn();
      let tree = render(
        <Table selectionMode="none" sortDescriptor={{column: 'foo', direction: 'ascending'}} onSortChange={onSortChange}>
          <TableHeader>
            <Column uniqueKey="foo" allowsSorting>Foo</Column>
            <Column uniqueKey="bar" allowsSorting>Bar</Column>
            <Column uniqueKey="baz">Baz</Column>
          </TableHeader>
          <TableBody>
            <Row>
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
              <Cell>Baz 1</Cell>
            </Row>
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let columnheaders = within(table).getAllByRole('columnheader');
      expect(columnheaders).toHaveLength(3);
      expect(columnheaders[0]).toHaveAttribute('aria-sort', 'ascending');
      expect(columnheaders[1]).toHaveAttribute('aria-sort', 'none');
      expect(columnheaders[2]).not.toHaveAttribute('aria-sort');

      act(() => triggerPress(columnheaders[0]));

      expect(onSortChange).toHaveBeenCalledTimes(1);
      expect(onSortChange).toHaveBeenCalledWith({column: 'foo', direction: 'descending'});
    });

    it('should toggle the sort direction from descending to ascending', function () {
      let onSortChange = jest.fn();
      let tree = render(
        <Table selectionMode="none" sortDescriptor={{column: 'foo', direction: 'descending'}} onSortChange={onSortChange}>
          <TableHeader>
            <Column uniqueKey="foo" allowsSorting>Foo</Column>
            <Column uniqueKey="bar" allowsSorting>Bar</Column>
            <Column uniqueKey="baz">Baz</Column>
          </TableHeader>
          <TableBody>
            <Row>
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
              <Cell>Baz 1</Cell>
            </Row>
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let columnheaders = within(table).getAllByRole('columnheader');
      expect(columnheaders).toHaveLength(3);
      expect(columnheaders[0]).toHaveAttribute('aria-sort', 'descending');
      expect(columnheaders[1]).toHaveAttribute('aria-sort', 'none');
      expect(columnheaders[2]).not.toHaveAttribute('aria-sort');

      act(() => triggerPress(columnheaders[0]));

      expect(onSortChange).toHaveBeenCalledTimes(1);
      expect(onSortChange).toHaveBeenCalledWith({column: 'foo', direction: 'ascending'});
    });

    it('should trigger sorting on a different column', function () {
      let onSortChange = jest.fn();
      let tree = render(
        <Table selectionMode="none" sortDescriptor={{column: 'foo', direction: 'ascending'}} onSortChange={onSortChange}>
          <TableHeader>
            <Column uniqueKey="foo" allowsSorting>Foo</Column>
            <Column uniqueKey="bar" allowsSorting>Bar</Column>
            <Column uniqueKey="baz">Baz</Column>
          </TableHeader>
          <TableBody>
            <Row>
              <Cell>Foo 1</Cell>
              <Cell>Bar 1</Cell>
              <Cell>Baz 1</Cell>
            </Row>
          </TableBody>
        </Table>
      );

      let table = tree.getByRole('grid');
      let columnheaders = within(table).getAllByRole('columnheader');
      expect(columnheaders).toHaveLength(3);
      expect(columnheaders[0]).toHaveAttribute('aria-sort', 'ascending');
      expect(columnheaders[1]).toHaveAttribute('aria-sort', 'none');
      expect(columnheaders[2]).not.toHaveAttribute('aria-sort');

      act(() => triggerPress(columnheaders[1]));

      expect(onSortChange).toHaveBeenCalledTimes(1);
      expect(onSortChange).toHaveBeenCalledWith({column: 'bar', direction: 'ascending'});
    });
  });

  describe('layout', function () {
    describe('row heights', function () {
      let renderTable = (props, scale) => render(
        <Table {...props}>
          <TableHeader columns={columns} columnKey="key">
            {column => <Column>{column.name}</Column>}
          </TableHeader>
          <TableBody items={items} itemKey="foo">
            {item =>
              (<Row>
                {key => <Cell>{item[key]}</Cell>}
              </Row>)
            }
          </TableBody>
        </Table>
      , scale);
  
      it('should layout rows with default height', function () {
        let tree = renderTable();
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[0].style.top).toBe('0px');
        expect(rows[0].style.height).toBe('34px');
        expect(rows[1].style.top).toBe('0px');
        expect(rows[1].style.height).toBe('49px');
        expect(rows[2].style.top).toBe('49px');
        expect(rows[2].style.height).toBe('49px');

        for (let cell of [...rows[1].childNodes, ...rows[2].childNodes]) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('48px');
        }
      });

      it('should layout rows with default height in large scale', function () {
        let tree = renderTable({}, 'large');
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[0].style.top).toBe('0px');
        expect(rows[0].style.height).toBe('40px');
        expect(rows[1].style.top).toBe('0px');
        expect(rows[1].style.height).toBe('65px');
        expect(rows[2].style.top).toBe('65px');
        expect(rows[2].style.height).toBe('65px');

        for (let cell of [...rows[1].childNodes, ...rows[2].childNodes]) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('64px');
        }
      });

      it('should layout rows with a custom rowHeight', function () {
        let tree = renderTable({rowHeight: 72});
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[0].style.top).toBe('0px');
        expect(rows[0].style.height).toBe('34px');
        expect(rows[1].style.top).toBe('0px');
        expect(rows[1].style.height).toBe('73px');
        expect(rows[2].style.top).toBe('73px');
        expect(rows[2].style.height).toBe('73px');

        for (let cell of [...rows[1].childNodes, ...rows[2].childNodes]) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('72px');
        }
      });

      it('should support variable row heights with rowHeight="auto"', function () {
        let scrollHeight = jest.spyOn(window.HTMLElement.prototype, 'scrollHeight', 'get')
          .mockImplementation(function () {
            return this.textContent === 'Foo 1' ? 64 : 48;
          });
        
        let tree = renderTable({rowHeight: 'auto'});
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(3);

        expect(rows[1].style.top).toBe('0px');
        expect(rows[1].style.height).toBe('65px');
        expect(rows[2].style.top).toBe('65px');
        expect(rows[2].style.height).toBe('49px');

        for (let cell of rows[1].childNodes) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('64px');
        }

        for (let cell of rows[2].childNodes) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('48px');
        }

        scrollHeight.mockRestore();
      });

      it('should support variable column header heights with rowHeight="auto"', function () {
        let scrollHeight = jest.spyOn(window.HTMLElement.prototype, 'scrollHeight', 'get')
          .mockImplementation(function () {
            return this.textContent === 'Tier Two Header B' ? 48 : 34;
          });
        
        let tree = render(
          <Table rowHeight="auto">
            <TableHeader columns={nestedColumns} columnKey="key">
              {column => <Column childColumns={column.children}>{column.name}</Column>}
            </TableHeader>
            <TableBody items={items} itemKey="foo">
              {item =>
                (<Row>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </Table>
        );
        let rows = tree.getAllByRole('row');
        expect(rows).toHaveLength(5);

        expect(rows[0].style.top).toBe('0px');
        expect(rows[0].style.height).toBe('34px');
        expect(rows[1].style.top).toBe('34px');
        expect(rows[1].style.height).toBe('48px');
        expect(rows[2].style.top).toBe('82px');
        expect(rows[2].style.height).toBe('34px');

        for (let cell of rows[0].childNodes) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('34px');
        }

        for (let cell of rows[1].childNodes) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('48px');
        }

        for (let cell of rows[2].childNodes) {
          expect(cell.style.top).toBe('0px');
          expect(cell.style.height).toBe('34px');
        }

        scrollHeight.mockRestore();
      });
    });

    describe('column widths', function () {
      it('should divide the available width by default', function () {
        let tree = render(
          <Table>
            <TableHeader columns={columns} columnKey="key">
              {column => <Column>{column.name}</Column>}
            </TableHeader>
            <TableBody items={items} itemKey="foo">
              {item =>
                (<Row>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </Table>
        );

        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('55px');
          expect(row.childNodes[1].style.width).toBe('315px');
          expect(row.childNodes[2].style.width).toBe('315px');
          expect(row.childNodes[3].style.width).toBe('315px');  
        }
      });

      it('should support explicitly sized columns', function () {
        let tree = render(
          <Table>
            <TableHeader>
              <Column uniqueKey="foo" width={200}>Foo</Column>
              <Column uniqueKey="bar" width={500}>Bar</Column>
              <Column uniqueKey="baz" width={300}>Baz</Column>
            </TableHeader>
            <TableBody items={items} itemKey="foo">
              {item =>
                (<Row>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </Table>
        );
        
        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('55px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('500px');
          expect(row.childNodes[3].style.width).toBe('300px');  
        }
      });

      it('should divide remaining width amoung remaining columns', function () {
        let tree = render(
          <Table>
            <TableHeader>
              <Column uniqueKey="foo" width={200}>Foo</Column>
              <Column uniqueKey="bar">Bar</Column>
              <Column uniqueKey="baz">Baz</Column>
            </TableHeader>
            <TableBody items={items} itemKey="foo">
              {item =>
                (<Row>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </Table>
        );
        
        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('55px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('372.5px');
          expect(row.childNodes[3].style.width).toBe('372.5px');  
        }
      });

      it('should support percentage widths', function () {
        let tree = render(
          <Table>
            <TableHeader>
              <Column uniqueKey="foo" width="10%">Foo</Column>
              <Column uniqueKey="bar" width={500}>Bar</Column>
              <Column uniqueKey="baz">Baz</Column>
            </TableHeader>
            <TableBody items={items} itemKey="foo">
              {item =>
                (<Row>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </Table>
        );
        
        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('55px');
          expect(row.childNodes[1].style.width).toBe('100px');
          expect(row.childNodes[2].style.width).toBe('500px');
          expect(row.childNodes[3].style.width).toBe('345px');  
        }
      });

      it('should support minWidth', function () {
        let tree = render(
          <Table>
            <TableHeader>
              <Column uniqueKey="foo" width={200}>Foo</Column>
              <Column uniqueKey="bar" minWidth={500}>Bar</Column>
              <Column uniqueKey="baz">Baz</Column>
            </TableHeader>
            <TableBody items={items} itemKey="foo">
              {item =>
                (<Row>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </Table>
        );
        
        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('55px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('500px');
          expect(row.childNodes[3].style.width).toBe('245px');  
        }
      });

      it('should support maxWidth', function () {
        let tree = render(
          <Table>
            <TableHeader>
              <Column uniqueKey="foo" width={200}>Foo</Column>
              <Column uniqueKey="bar" maxWidth={300}>Bar</Column>
              <Column uniqueKey="baz">Baz</Column>
            </TableHeader>
            <TableBody items={items} itemKey="foo">
              {item =>
                (<Row>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </Table>
        );
        
        let rows = tree.getAllByRole('row');

        for (let row of rows) {
          expect(row.childNodes[0].style.width).toBe('55px');
          expect(row.childNodes[1].style.width).toBe('200px');
          expect(row.childNodes[2].style.width).toBe('300px');
          expect(row.childNodes[3].style.width).toBe('445px');  
        }
      });

      it('should compute the correct widths for tiered headings', function () {
        let tree = render(
          <Table>
            <TableHeader columns={nestedColumns} columnKey="key">
              {column => <Column childColumns={column.children}>{column.name}</Column>}
            </TableHeader>
            <TableBody items={items} itemKey="foo">
              {item =>
                (<Row>
                  {key => <Cell>{item[key]}</Cell>}
                </Row>)
              }
            </TableBody>
          </Table>
        );

        let rows = tree.getAllByRole('row');

        expect(rows[0].childNodes[0].style.width).toBe('244px');
        expect(rows[0].childNodes[1].style.width).toBe('756px');

        expect(rows[1].childNodes[0].style.width).toBe('244px');
        expect(rows[1].childNodes[1].style.width).toBe('378px');
        expect(rows[1].childNodes[2].style.width).toBe('189px');
        expect(rows[1].childNodes[3].style.width).toBe('189px');

        for (let row of rows.slice(2)) {
          expect(row.childNodes[0].style.width).toBe('55px');
          expect(row.childNodes[1].style.width).toBe('189px');
          expect(row.childNodes[2].style.width).toBe('189px');
          expect(row.childNodes[3].style.width).toBe('189px');
          expect(row.childNodes[4].style.width).toBe('189px');
          expect(row.childNodes[5].style.width).toBe('189px');
        }
      });
    });
  });
});