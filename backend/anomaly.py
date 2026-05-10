import numpy as np
from sklearn.ensemble import IsolationForest

def calculate_zscore(values: list[float]) -> list[float]:
    """
    Takes a list of numbers and returns a list of z-scores.
    each z score describes how usual that value is
    compared to the rest of the list.
    - Negative scores means that the value is below the mean.
        which could mean less trading happened than normal
    - Positive scores means that the value is above the mean
        which could signify anomalies within the volume traded
    """

    arr = np.array(values)
    mean = np.mean(arr)
    std = np.std(arr)

    # if all values are identical, std is 0
    # division by zero would crash so return all 0s instead

    if std == 0:
        return [0.0] * len(values)
    # doing this actually subtracts from every element
    # didn't know that, don't have to loop around the entire list
    # so it calcs the z score for all the values and returns as a list
    return ((arr - mean) / std).tolist()


def detect_volume_anomalies(bars: list[dict]) -> list[dict]:

    # if there's not enough data then info isn't valuable / accurate enough
    if len(bars) < 5:
        return bars

    # goes through every bar and pulls volume, adds it
    # to a list
    volumes = [bar["volume"] for bar in bars]
    """
    ^^^
    volumes = []
    for bar in bars:
        volumes.append(bar["volume"])
    """
    # returns a list of zscores for the volumes provided
    zscores = calculate_zscore(volumes)

    # enumerate keeps track of index and current item
    # i bar -> 0, bar0
    # 1, bar1 etc
    # if we didn't use enumerate then we couldn't look up the right zscore
    # for each bar.
    for i, bar in enumerate(bars):
        # for every bar add a volume_zscore/anomaly flag and then key value on it
        bar["volume_zscore"] = round(zscores[i], 2)
        bar["volume_anomaly"] = zscores[i] >= 2.0

    return bars

def detect_price_anomalies(bars: list[dict]) -> list[dict]:
    if len(bars) < 10:
        return bars

    # extract OHLC features from bars
    features = [[bar["open"], bar["high"], bar["low"], bar["close"]] for bar in bars]

    # create a single instance of IsolationForest
    forest = IsolationForest(contamination=0.10, random_state=42)
    predictions = forest.fit_predict(features)

    # gives values between -0.5 and 0.5
    # so negative values -> anomalous (isolated quickly in the tree)
    # positive values -> normal (took many splits to isolate)
    # around 0 -> borderline
    anomalies = forest.decision_function(features)

    for i, bar in enumerate(bars):
        bar["price_anomaly"] = predictions[i] == -1
        # normalize values (-0.5 looks weird to display so 0 is going
        # to be anomalous)
        bar["anomaly_score"] = round(float(1 - (anomalies[i] + 0.5)), 3)

    return bars

def get_anomaly_summary(bars: list[dict]):
    if not bars:
        return {}

    volume_anomalies = [bar for bar in bars if bar["volume_anomaly"]]
    count_volume_anomalies = len(volume_anomalies)
    price_anomalies = [bar for bar in bars if bar["price_anomaly"]]
    count_price_anomalies = len(price_anomalies)

    peak = max(bars, key=lambda bar: bar.get("anomaly_score", 0))

    summary = {
        "total_bars": len(bars),
        "count_volume_anomalies": count_volume_anomalies,
        "count_price_anomalies": count_price_anomalies,
        "peak_anomaly": {
            "timestamp": peak["timestamp"],
            "score": peak.get("anomaly_score", 0),
            "close": peak.get("close", 0),
        }
    }
    return summary
