# In Depth Neighbors Seeker Algorithm Visualizer
Visualizer of what I'm calling **In Depth Neighbors Seeker** Algorithm 😅

### Why?
I've discovered [this](https://youtu.be/4tYoVx0QoN0) challenge and I just wanted to solve it by myself, after ~5 hours I came up with this solution.
I don't have any experience with algorithms, so maybe I've just recreated something that already exists, but I still feel very proud of myself for successfully completing this challenge.

#### Challenge
The challenge is pretty simple, there is a matrix filled with 0 and 1, our goal is to retrieve only the 1 which are **vertically** or **orizontally** connected, but the connection **must start from a border**. Then just remove the 1 which are not connected.<br>
(*Even if behind the scenes the algorithms correctly returns the matrix, I've decided to leave the unlinked cells in order to better visualize the matrix*)

This
```
100111
101010
011100
100000
011010
010000
```

Would become
```
100111
100010
000000
100000
011000
010000
```

If it would have been processed with the visualizer
<br>
![example](https://user-images.githubusercontent.com/39502043/123146959-286ec480-d467-11eb-874e-c46d5872c072.png)




### Visualizer
After seeing some cool folks building some amazing algorithms visualizers, I decided to do the same, and I had a lot of fun during the process 😁
<br><br>
**Visualizer available [here](https://adimarianmutu.github.io/In-Depth-Neighbours-Seeker-Algorithm-Visualizer/)**
