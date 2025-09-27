import datetime

class User:
    def __init__(self, name, year, major, email):
        self.name = name
        self.year = year
        self.major = major
        self.email = email

    def __repr__(self):
        return f"User({self.name}, {self.year}, {self.major})"
    #getter methods
    def get_name(self):
        return self.name
    def get_year(self):
        return self.year
    def get_major(self):
        return self.major
    def get_email(self):
        return self.email

    #setter methods
    def set_name(self, name):
        self.name = name
    def set_year(self, year):
        self.year = year
    def set_major(self, major):
        self.major = major

class Post:

    def __init__(self, author_user, location, time_expiration, group_current, group_size_max, course):
        self.author_user = author_user
        self.location = location
        self.time_creation = datetime.datetime.now()
        self.time_expiration = datetime.timedelta(hours=time_expiration)
        self.course = course
        self.group_current = group_current
        self.group_size_max = group_size_max
        self.show_in_results = True

    def __repr__(self):
        return self.author_user

    #getter methods
    def get_author_user(self):
        return self.author_user
    def get_location(self):
        return self.location
    def get_time_creation(self):
        time = str(self.time_creation).split(" ")[1].split(":")[0:2]
        time = ":".join(time)
        dt_object = datetime.datetime.strptime(time, "%H:%M")
        normal_time = dt_object.strftime("%I:%M %p")
        return normal_time
    def get_time_expiration(self):
        return str(self.time_expiration).split(":")[0]
    def get_course(self):
        return self.course
    def get_group_current(self):
        return self.group_current
    def get_group_size_max(self):
        return self.group_size_max
    def get_results_status(self):
        return self.show_in_results

    def check_group_status(self):
        if self.group_current >= self.group_size_max:
            self.show_in_results = False
        elif self.group_current < self.group_size_max:
            self.show_in_results = True

    def increase_group_size(self):
        self.group_current += 1
        self.check_group_status()

    def decrease_group_size(self):
        self.group_current -= 1
        self.check_group_status()

    def check_expiration(self):
        time_now = datetime.datetime.now()
        if time_now - self.time_creation > self.time_expiration:
            self.show_in_results = False

post_list = []

#location -> (preference_ranking 1 or 2, location names); course -> (preference_ranking 1 or 2, course name)
def search(locations, course):
    two_match = []
    first_pref_match = []
    second_pref_match = []

    for post in post_list:
        match_location = (post.get_location() in locations[1:])
        match_course = (post.get_course() == course[1])
        if match_location and match_course:
            two_match.append(post)
        elif int(course[0]) == 1:
            if match_course:
                first_pref_match.append(post)
            elif match_location:
                second_pref_match.append(post)
        elif int(locations[0]) == 1:
            if match_location:
                first_pref_match.append(post)
            elif match_course:
                second_pref_match.append(post)
    return two_match + first_pref_match + second_pref_match

#idiot testing
#both match

post1 = Post("post1","marston",5,1,2,"STA3100")

print(post1.get_time_creation())









