import csv
import pandas as pd
import json
import os

class StopsParser():
    def __init__(self) -> None:
        self.data_dir = "raw"
        self.output_dir = "processed"

        self.stops_raw = pd.read_csv(os.path.join(self.data_dir, "stops.txt"))
        self.stops_raw.drop(columns=[
            "stop_code",
            "stop_desc",
            "stop_url",
            "location_type",
            "stop_timezone",
            "wheelchair_boarding",
            "platform_code"
        ], inplace=True)

    def process(self):
        self.stops_raw.to_json(os.path.join(self.output_dir, 'stops.json'), orient='records')

StopsParser().process()
