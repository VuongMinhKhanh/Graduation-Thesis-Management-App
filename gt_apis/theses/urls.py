from django.contrib import admin
from django.urls import path, re_path, include
from rest_framework import routers
from theses import views


r = routers.DefaultRouter()
# r.register("categories", views.CategoryViewSet)
# r.register("theses", views.CourseViewSet)
# r.register("lessons", views.LessonViewSet, "lessons")
r.register("users", views.UserViewSet, "users")
r.register("sinh_vien", views.SinhVienViewSet, "sinh_vien")
r.register("giang_vien", views.GiangVienViewSet, "giang_vien")
r.register("giao_vu", views.GiaoVuViewSet, "giao_vu")

# r.register("comments", views.CommentViewSet, "comments")
r.register("KLTN", views.KLTNViewSet, "KLTN")
r.register("HDBVKL", views.HDBVKLViewSet, "HDBVKL")
r.register("Diem", views.DiemViewSet, "Diem")
r.register("TieuChi", views.TieuChiViewSet, "TieuChi")
r.register("KLTNDetails", views.KLTNDetailsViewSet, "KLTNDetails")
r.register("EmailConfirm", views.EmailConfirmViewSet, "EmailConfirm")
urlpatterns = [
    path("", include(r.urls)),
    # path('admin/', admin.site.urls),
    re_path(r'^ckeditor/', include('ckeditor_uploader.urls'))
]

