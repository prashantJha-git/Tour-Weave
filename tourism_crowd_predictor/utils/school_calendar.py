from __future__ import annotations

# month (1-12) -> vacation intensity score (0-3). See module docstring
# for what each score level means.
SCHOOL_VACATION_INTENSITY: dict[int, int] = {
    1: 0,   # January -- back in session after winter break
    2: 0,   # February -- regular term, pre-exam season
    3: 0,   # March -- board exam season for many states, low travel
    4: 1,   # April -- results/admissions season, short breaks begin
    5: 3,   # May -- peak summer vacation
    6: 2,   # June -- summer vacation continues in most states
    7: 0,   # July -- new academic year begins, back in session
    8: 0,   # August -- regular term
    9: 0,   # September -- regular term
    10: 1,  # October -- Dussehra/autumn break in several states
    11: 0,  # November -- regular term resumes post-Diwali
    12: 2,  # December -- winter/Christmas break, widely observed
}


def vacation_intensity(month: int) -> int:
    return SCHOOL_VACATION_INTENSITY.get(month, 0)
