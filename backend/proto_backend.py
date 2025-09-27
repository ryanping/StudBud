
class User:
    def __init__(self, name, year, major):
        self.name = name
        self.year = year
        self.major = major
    #getter methods
    def get_name(self):
        return self.name
    def get_year(self):
        return self.year
    def get_major(self):
        return self.major
    #setter methods
    def set_name(self, name):
        self.name = name
    def set_year(self, year):
        self.year = year
    def set_major(self, major):
        self.major = major


class Post:
    def __init__(self, author_user, location, time_creation, time_expiration, group_current, group_size_max, course):
        self.author_user = author_user
        self.location = location
        self.time_creation = time_creation
        self.time_expiration = time_expiration
        self.course = course
        self.group_current = group_current
        self.group_size_max = group_size_max
        self.group_filled = False

    def __repr__(self):
        return self.author_user

    #getter methods
    def get_author_user(self):
        return self.author_user
    def get_location(self):
        return self.location
    def get_time_creation(self):
        return self.time_creation
    def get_time_expiration(self):
        return self.time_expiration
    def get_course(self):
        return self.course
    def get_group_current(self):
        return self.group_current
    def get_group_size_max(self):
        return self.group_size_max
    def get_group_filled(self):
        return self.group_filled


    def check_if_group_filled(self):
        if self.group_current >= self.group_size_max:
            self.group_filled = True

    def increase_group_size(self):
        self.group_current += 1
        self.check_if_group_filled()

    def decrease_group_size(self):
        self.group_current -= 1

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
        elif course[0] == 1:
            if match_course:
                first_pref_match.append(post)
            elif match_location:
                second_pref_match.append(post)
        elif locations[0] == 1:
            if match_location:
                first_pref_match.append(post)
            elif match_course:
                second_pref_match.append(post)
    return two_match + first_pref_match + second_pref_match

#idiot testing
#both match
post1 = Post("post1","marston","na","na",1,2,"STA3100")
post4 = Post("post4","marston","na","na",1,2,"STA3100")

#one match
post2 = Post("post2","lib west","na","na",1,2,"STA3100")
post3 = Post("post3","marston","na","na",1,2,"COP3502")
post5 = Post("post5","marston","na","na",1,2,"POS2100")

#no match
post6 = Post("post6","newell","na","na",1,2,"STA3100")

post_list.extend([post1,post2,post3,post4,post5,post6])

print(search((2,"marston","lib west"),(1,"STA3100")))














