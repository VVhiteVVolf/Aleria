"""Bounded operating-system lock for explicit Leukonia asset commands."""
from contextlib import contextmanager
import errno
import os
from pathlib import Path
import time


@contextmanager
def asset_pipeline_lock(path: Path, timeout: float = 180):
    """Serialize writers; the OS releases the byte lock if a process exits."""
    if timeout < 0:
        raise ValueError("Lock timeout must not be negative")
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a+b") as stream:
        stream.seek(0, os.SEEK_END)
        if stream.tell() == 0:
            stream.write(b"\0")
            stream.flush()
        if os.name == "nt":
            import msvcrt
            def acquire():
                stream.seek(0)
                msvcrt.locking(stream.fileno(), msvcrt.LK_NBLCK, 1)
            def release():
                stream.seek(0)
                msvcrt.locking(stream.fileno(), msvcrt.LK_UNLCK, 1)
        else:
            import fcntl
            def acquire():
                fcntl.flock(stream.fileno(), fcntl.LOCK_EX | fcntl.LOCK_NB)
            def release():
                fcntl.flock(stream.fileno(), fcntl.LOCK_UN)
        started = time.monotonic()
        last_notice = started - 5
        while True:
            try:
                acquire()
                break
            except OSError as error:
                if error.errno not in {errno.EACCES, errno.EAGAIN, errno.EDEADLK}:
                    raise
                elapsed = time.monotonic() - started
                if elapsed >= timeout:
                    raise TimeoutError(f"Asset pipeline is busy after {timeout:g}s; retry this explicit command.") from error
                if time.monotonic() - last_notice >= 5:
                    print(f"Waiting for Leukonia asset writer ({elapsed:.0f}s).", flush=True)
                    last_notice = time.monotonic()
                time.sleep(min(.25, timeout-elapsed))
        try:
            yield
        finally:
            release()
