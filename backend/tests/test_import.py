import traceback
import sys

try:
    import api.main
    print("SUCCESS")
except Exception as e:
    traceback.print_exc(file=sys.stdout)
