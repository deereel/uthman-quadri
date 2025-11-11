# Fix Content Shift Issue

## Problem
The contents of the website page are shifted to the left, making it hide under the navigation.

## Solution
Adjust the positioning in the CSS to ensure content starts after the navigation by adding z-index to bring content above navigation shadow and centering the text.

## Steps
- [ ] Add z-index: 1000 to .canvas_container in public/resources/css/home.css to ensure content is above the navigation's shadow
- [ ] Add text-align: center to .content-for-home h1 and .content-for-home p in public/resources/css/home.css to center the text
- [ ] Remove deprecated align="center" from h1 and p in index.html
- [ ] Test the changes by launching the development server
