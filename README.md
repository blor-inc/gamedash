# [mito](https://mito-lol.herokuapp.com/)

## Screenshots

![app-load](https://user-images.githubusercontent.com/6797157/141599382-14a9c744-ab28-4c37-a177-4229d96e6496.png)

![app1](https://user-images.githubusercontent.com/6797157/141599388-6502b933-84a3-4c86-b06c-5559d5562d19.png)

## Inspiration
We were inspired by a member's dashboard that they used at work. On that dashboard, all sorts of different information could be viewed at the same time as charts and graphs, allowing the user to visually take in information and compare data as well. 
When we think about how we interpret data from our League games, we realized that websites currently available to the community may have a lot of raw data reported, but are not necessarily presented in a visually digestible way. With this project, we wanted to try and graph player data that can help players to parse through and understand things from the data from post-game stats that would not otherwise be apparent from just looking at the numbers. 

## What it does
The user is able to search their League summoner name, by region. Our website will pull relevant information from the Riot API, and generate graphs on the screen. The graphs will be related to their last 10 ranked games played and describe some sort of statistic, synthesized by related data points. Descriptions are also provided with each set of graphs to describe what the statistic would mean and how it was calculated. 

## How we built it
We started in VS Code, and built the website with vanilla HTML/CSS. The website's low-light theme is meant to be comfortable to look at, with colors that pop out to draw the user's eyes to the important stuff. We used JavaScript to link together our website's visuals and to give elements functionality, as well as to pull information from Riot's API. Our team used Git and GitHub to sync our work as we built out different parts of the project. Toward the end we stood up a backend server with ExpressJS, NodeJS, and Heroku. Currently the app is now hosted there.

## Challenges we ran into
We ran into so many challenges. Two of our members are beginners, and were learning many things for the first time. HTML and CSS were totally new to one member, who learned it from scratch to build the front-facing part of the website. 

In addition, the Riot API's are pretty complicated, and it usually requires a few chain API calls to get the information you need. It was quite challenging to manage all the different API calls we had to make, as well as collecting the data and synthesizing it into graphs. There were several metrics we wanted to implement, but because of the time restraint, we did not have enough time to fully create equations that synthesized data from many different parts of the Riot API. 

Additionally, since there are four of us, we were constantly pushing changes and resolving merge conflicts. Sometimes we had quite complicated conflicts that took much time to resolve. We often pinged each other to look through the merge conflicts together, and to check pull requests that didn't make any sense.

Lastly, our greatest challenge was scaling down our goals. This project challenged us to manage our expectations and to push through despite the setbacks we faced. We originally had a grand vision, but it would have been very difficult to accomplish. In addition, we were bringing up new creative ideas throughout the week that we would have loved to see in our final iteration. However, we knew that we couldn't make all of our goals and ideas in time. In the end, we decided to focus on features that are not explicitly in other existing League statistics websites, as to not spend precious time on components that are already commonly found online.

## Accomplishments that we're proud of
We're proud of putting together a website that can actually pull data from API's and graph them. Throughout all of the challenges we faced as a team as well as individually, we pulled through with a project that we all contributed to and are excited about. Despite all of the things that challenged our teamwork, we are proud of pulling together through our disagreements to compromise. In addition, we are proud of working through all the different (and confusing) bugs we encountered every step of the way.

## What we learned
As a team, we learned to delegate tasks throughout the team and to ask for help and offer help. We learned that although it may seem easy (at first) to reach all our initial goals, it is actually not all as simple as it seems. In addition, we learned a lot about each other's different viewpoints during our discussions at team meetings.

Individually, we each learned skills that we previously did not before. These things include using HTML and CSS to create a visually appealing website, linking the elements on the website to functions behind-the-scenes in JavaScript, creating functions that make API calls to the Riot API, troubleshooting online, and git workflow.

## What's next for mito
We would really like to implement many more features for the future of mito. There are many metrics we would have liked to implement, such as combined kills per min, kills per win / deaths per loss, and many more. 

For simplicity, we stuck to pie charts this time, but we would have liked to incorporate more data-heavy types of graphs, such as radar charts to compare different statistical categories, line charts to compare personal growth, and bar charts to compare vs benchmark values. 

In addition, we would like to incorporate the ability to search multiple players and to compare stats head-to-head. This would require some intricate features as well as data overlays, which could not be achieved over the course of the hackathon timeline. This would not be limited to just your friends and teammates - it would also include the ability to compare yourself to the pros competing in the scene.

Lastly, there were many 'bells and whistles'-type features we really would like to implement. There are many features we passed up on for this iteration because they were already available on other popular websites. For example, a future iteration of mito would have an area that summarizes the user's stats, such as their ranking and their LP graph, as well as their basic post-game statistical report data. We would also love to have some fun features such as badges for your in-game strengths that you can acquire as you rank up and improve at the game.
