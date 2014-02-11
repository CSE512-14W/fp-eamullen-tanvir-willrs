a3-eamullen-tanvir
===============

## Team members

1. Eric Mullen (emullen@cs.washington.edu)
2. Tanvir Aumi (tanvir@cs.washington.edu)

## Home Energy Disaggregation

In this project, we focused on appliance level energy consupmtion of household items. When we receive our electricity bill at the end of the month, we just see a single amount which is the total electricity consumption cost of a home over the course of the month. But recently, different techniques have been invented to figure out appliance level energy consumption. The goal of this project is to create a simple user-friendly visualization with these data. Just by looking at the visualization, users should be able to figure out the appliance which is causing her most amount of bill. Now she can either change the appliance and buy a more energy friendly one, or use it less frequently to save some money. This will help the users not only to save their money, but also to reduce their carbon footprint on the planet.

## Running Instructions

To run our code, download the repository, and run a simple python http server. Run "python -m SimpleHTTPServer" in the root project directory, and access at "http://localhost:8000".

## Story Board

Link: https://github.com/CSE512-14W/a3-eamullen-tanvir/blob/master/storyboard.pdf

### Changes between Storyboard and the Final Implementation

Due to time constraint and data shortage, we could not get to the point of dynamic timeline simulation. Right now the visualization shows the total power consumption over the entire time and a prediction of yearly cost for the appliance. Also there is no option to sort the appliances over energy usage. But we are planning to extend this to our final project and hope to accomplish all these with a lot of additional features.

## Development Process

Tanvir:
 * Came up with idea
 * Storyboarded
 * Described vision
 * Provided data
 * Gathered images
 * Wrote up project description

Eric:
 * Drafted app
 * Polished app
 * Investigated data

As this was our first time using any web technologies whatsoever, we spent quite a while trying to wrap our heads around what the DOM was, what CSS was, how to write code in javascript, how to debug a web application, and even just what these HTML tags were all about. We spent a long time on many different tutorials online, and many hours frustrated at javascript.

In terms of the process once the project got off the ground, there was a lot of almost copy pasting from one tutorial or another. Mostly the entire process was "What feature do we want? We want X. Google for how to make X in d3. Look at examples". This served us reasonably well, and I think we have a decent idea of how d3 works now. The hardest part was maintaining the mapping between our data and the DOM, which was straightforward if we did it right, and completely baffling when we messed it up. In the end we got it to work. It's still quite rough around the edges, but we hope to improve it for our final project.



