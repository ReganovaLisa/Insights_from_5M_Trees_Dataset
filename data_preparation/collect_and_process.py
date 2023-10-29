import kaggle
import os
import pandas as pd

if __name__ == "__main__":
    kaggle.api.authenticate()
    kaggle.api.dataset_download_files('mexwell/5m-trees-dataset', path='../data_raw', unzip=True)