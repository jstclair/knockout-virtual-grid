# Knockout Virtual Grid

Knockout Virtual Grid is a Knockout component for working with large amounts of data in tables via cell virtualization.

In order to for the table to provide a 'native' table appearance (for both arrow-key navigation and editing), it uses [editableCell](https://github.com/gnab/editableCell).

## Demo

[Knockout Virtual Grid Demo](http://jsbin.com/kezoru/1/) (via JSBin - click the HTML and Javascript buttons to see the code)

## Requirements
Knockout Virtual Grid is designed to work with Knockout 3.2 (via the new "component" support) and RequireJS.

## Installation

You can install it via **bower**:

```shell
bower install --save knockout-virtual-grid
```

Next, you need to register Knockout Virtual Grid and its dependencies in RequireJs.
One way is via a global requirejs configuration object (shown below).

> NOTE: the path key **must** match the name shown below

```javascript
requirejs.config({
    paths: {
        knockout: 'bower_components/knockout/dist/knockout',
        editablecell: 'bower_components/knockout-editable-cell/out/editableCell',
        'src/knockout-virtual-grid': 'bower_components/knockout-virtual-grid/out/knockout-virtual-grid'
    },
    shim: {
        editablecell: { deps: ['knockout'] },
        'src/knockout-virtual-grid': { deps: ['knockout', 'editablecell'] }
    }
});
```

You also need to add a reference to its stylesheet:

```html
<html>
    <head>
    <link href="bower_components/knockout-virtual-grid/out/knockout-virtual-grid.min.css" rel="stylesheet" />
```

Then, you need to register it as a Knockout component in your project:

```javascript
ko.components.register('virtual-grid', {
    { require: 'src/knockout-virtual-grid' }
});
```

Finally, you can **use** Knockout Virtual Grid in a view by adding the component,
and populating its parameters:

~~~ html
<virtual-grid params="dataSource: myDataSource"></virtual-grid>
~~~


## Documentation

> NOTE: Futher documentation to come!

Until the remainder of the functionality and documentation is in place, you can
look at the [live demo](http://jsbin.com/kezoru/1/), or at the live demo's base project [vg-demo](https://github.com/jstclair/vg-demo).

<!--
## Publishing to Github

To publish, run:

```shell
git add -f out/*
git checkout head
git commit -m "Version {version} for distribution"
git tag -a v{version} -m "Add tag v{verson}"
git checkout master
git push origin --tags
```
-->
