### quickly thrown together solutions

#### object-query
Given `persons[{ age, pets: [{type,size}] }]`
1. an http query of `?pets.type=dog&pets.size=small`
2. becomes params `{ "pets.type": "dog", "pets.size": "small", "age": 30 }`
3. `persons.filter(queryMatch(params))` will return 30yo persons with small dogs.

Built to enhance an endpoint that returned an array of objects.
Step 1 & 2 are performed by express. `object-query` supports truthy matching
any combination of fields.
