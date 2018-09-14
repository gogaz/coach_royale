from box import Box, BoxList


class FakeAPIClient():
    def __init__(self):
        self.count = 0

    def get_clan(self, *args, **kwargs):
        data = {
            "tag": "ABCDEF",
            "name": "Clan name",
            "description": "Some clan description",
            "type": "open",
            "score": 42463,
            "memberCount": 50,
            "requiredScore": 4000,
            "donations": 9532,
            "badge": {
                "name": "flag_j_03",
                "category": "02_Flag",
                "id": 16000077,
                "image": "https://royaleapi.github.io/cr-api-assets/badges/flag_j_03.png"
            },
            "location": {
                "name": "France",
                "isCountry": True,
                "code": "FR"
            },
            "members": [
                {
                    "name": "J™️⚡️",
                    "tag": "ABCDEF01",
                    "rank": 1,
                    "previousRank": 1,
                    "role": "coLeader",
                    "expLevel": 13,
                    "trophies": 4709,
                    "donations": 96,
                    "donationsReceived": 280,
                    "donationsDelta": -184,
                    "arena": {
                        "name": "Challenger III",
                        "arena": "League 3",
                        "arenaID": 15,
                        "trophyLimit": 4600
                    },
                    "donationsPercent": 0.5
                },
                {
                    "name": "z",
                    "tag": "ABCDEF02",
                    "rank": 2,
                    "previousRank": 3,
                    "role": "elder",
                    "expLevel": 12,
                    "trophies": 4687,
                    "donations": 583,
                    "donationsReceived": 460,
                    "donationsDelta": 123,
                    "arena": {
                        "name": "Challenger III",
                        "arena": "League 3",
                        "arenaID": 15,
                        "trophyLimit": 4600
                    },
                    "donationsPercent": 3.06
                },
                {
                    "name": "g",
                    "tag": "ABCDEF03",
                    "rank": 3,
                    "previousRank": 2,
                    "role": "leader",
                    "expLevel": 13,
                    "trophies": 4674,
                    "donations": 554,
                    "donationsReceived": 380,
                    "donationsDelta": 174,
                    "arena": {
                        "name": "Challenger III",
                        "arena": "League 3",
                        "arenaID": 15,
                        "trophyLimit": 4600
                    },
                    "donationsPercent": 2.91
                },
            ]
        }
        return Box(data, camel_killer_box=True)

    def get_clan_war_log(self, *args, **kwargs):
        return []
