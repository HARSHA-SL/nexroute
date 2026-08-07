from app.db.session import engine
from app.db.base import Base

# Import ALL models so SQLAlchemy registers them
from app.models import *

Base.metadata.create_all(bind=engine)

print("All tables created successfully!")