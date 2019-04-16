import random
import string
import time

from box import Box, BoxList


class FakeAPIClient:
    def __init__(self):
        self.count = 0

    def get_clan(self, *args, **kwargs):
        data = {
            "tag": "ABCDEF",
            "name": "Clan name",
            "description": "Some clan description",
            "type": "open",
            "score": 42463,
            "warTrophies": 9999,
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
        data = [
            {
                "createdDate": 1536937058,
                "participants": [
                    {
                        "tag": "ABCDEF01",
                        "name": "J™️⚡️",
                        "cardsEarned": 280,
                        "battlesPlayed": 2,
                        "wins": 1,
                        "collectionDayBattlesPlayed": 1
                    },
                    {
                        "tag": "ABCDEF02",
                        "name": "z",
                        "cardsEarned": 1680,
                        "battlesPlayed": 1,
                        "wins": 1,
                        "collectionDayBattlesPlayed": 3
                    }
                ],
                "standings": [
                    {
                        "tag": "ABC",
                        "name": "Oops! My B@d",
                        "participants": 27,
                        "battlesPlayed": 25,
                        "wins": 15,
                        "crowns": 26,
                        "warTrophies": 1921,
                        "warTrophiesChange": 115,
                        "badge": {
                            "name": "Skull_03",
                            "category": "01_Symbol",
                            "id": 16000026,
                            "image": "https://royaleapi.github.io/cr-api-assets/badges/Skull_03.png"
                        }
                    },
                    {
                        "tag": "ABCDEF",
                        "name": "Clan name",
                        "participants": 26,
                        "battlesPlayed": 25,
                        "wins": 13,
                        "crowns": 19,
                        "warTrophies": 2024,
                        "warTrophiesChange": -12,
                        "badge": {
                            "name": "flag_j_03",
                            "category": "02_Flag",
                            "id": 16000077,
                            "image": "https://royaleapi.github.io/cr-api-assets/badges/flag_j_03.png"
                        }
                    }
                ],
                "seasonNumber": 11
            },
            {
                "createdDate": 1536764194,
                "participants": [
                    {
                        "tag": "ABCDEF01",
                        "name": "J™️⚡️",
                        "cardsEarned": 1680,
                        "battlesPlayed": 1,
                        "wins": 1,
                        "collectionDayBattlesPlayed": 3
                    },
                    {
                        "tag": "ABCDEF02",
                        "name": "z",
                        "cardsEarned": 1400,
                        "battlesPlayed": 1,
                        "wins": 1,
                        "collectionDayBattlesPlayed": 3
                    },
                    {
                        "tag": "ABCDEF03",
                        "name": "g",
                        "cardsEarned": 1225,
                        "battlesPlayed": 1,
                        "wins": 1,
                        "collectionDayBattlesPlayed": 3
                    },
                ],
                "standings": [
                    {
                        "tag": "ABCDEF",
                        "name": "Clan name",
                        "participants": 26,
                        "battlesPlayed": 25,
                        "wins": 14,
                        "crowns": 28,
                        "warTrophies": 2036,
                        "warTrophiesChange": 114,
                        "badge": {
                            "name": "flag_j_03",
                            "category": "02_Flag",
                            "id": 16000077,
                            "image": "https://royaleapi.github.io/cr-api-assets/badges/flag_j_03.png"
                        }
                    },
                    {
                        "tag": "DEF",
                        "name": "Grosse klan",
                        "participants": 25,
                        "battlesPlayed": 24,
                        "wins": 14,
                        "crowns": 23,
                        "warTrophies": 1788,
                        "warTrophiesChange": 64,
                        "badge": {
                            "name": "Coin_03",
                            "category": "03_Royale",
                            "id": 16000104,
                            "image": "https://royaleapi.github.io/cr-api-assets/badges/Coin_03.png"
                        }
                    },
                ],
                "seasonNumber": 11
            },
            {
                # Duplicated `createdDate` value
                "createdDate": 1536937058,
                "participants": [],
                "standings": [],
                "seasonNumber": 11
            }
        ]
        return BoxList(data, camel_killer_box=True)

    def get_open_tournaments(self, *args, **kwargs):
        data = []
        for i in range(50):
            t = {
                    "create_time": time.time() - random.randint(60, 3600),
                    "duration": 3600 * 2,
                    "prep_time": 3600,
                    "start_time": None,
                    "end_time": None,
                    "tag": ''.join(random.choice(string.ascii_uppercase + string.digits) for _ in range(8)),
                    "name": ''.join(random.choice(string.ascii_uppercase) for _ in range(8)),
                    "max_players": random.choice([50, 100, 1000]),
                    "current_players": random.randint(10, 49),
                    "status": random.choice(["inProgress", "inPreparation"]),
                    "open": True,
                 }
            data.append(t)
        return BoxList(data, camel_killer_box=True)

    def get_top_clans(self, *args, **kwargs):
        data = [
            {
                "tag": "8R8YULRJ",
                "name": "Sandstorm",
                "score": 59563,
                "memberCount": 50,
                "rank": 1,
                "previousRank": 2,
                "badge": {
                    "name": "Twin_Peaks_02",
                    "category": "01_Symbol",
                    "id": 16000097,
                    "image": "https://cr-api.github.io/cr-api-assets/badges/Twin_Peaks_02.png"
                },
                "location": {
                    "name": "International",
                    "isCountry": False,
                    "code": "_INT"
                }
            },
            {
                "tag": "LCVUYCR",
                "name": "Nova eSports",
                "score": 59471,
                "memberCount": 45,
                "rank": 2,
                "previousRank": 1,
                "badge": {
                    "name": "Star_Shine_03",
                    "category": "01_Symbol",
                    "id": 16000044,
                    "image": "https://cr-api.github.io/cr-api-assets/badges/Star_Shine_03.png"
                },
                "location": {
                    "name": "International",
                    "isCountry": False,
                    "code": "_INT"
                }
            },
            {
                "tag": "ABCDEF",
                "name": "Some clan name",
                "score": 42000,
                "memberCount": 45,
                "rank": 3,
                "previousRank": 42,
                "badge": {
                    "name": "",
                    "category": "",
                    "id": 1,
                    "image": "https://.png"
                },
                "location": {
                    "name": "France",
                    "isCountry": True,
                    "code": "FR"
                },
            },
        ]
        return BoxList(data, camel_killer_box=True)
